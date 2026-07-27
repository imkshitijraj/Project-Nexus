import { and, desc, eq } from "drizzle-orm";
import { getWorkspaceUser } from "../../session-auth";
import { getDb } from "../../../db";
import {
  accessAuditEvents,
  approvalRequests,
  projectMembers,
  projects,
  workspaceMembers,
} from "../../../db/schema";

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table")) {
    return "Project storage is being prepared. Please try again shortly.";
  }
  return message;
}

export async function GET() {
  try {
    const user = await getWorkspaceUser();
    if (!user) {
      return Response.json({ error: "Sign in to continue." }, { status: 401 });
    }
    const db = await getDb();
    const email = user.email.toLowerCase();
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.email, email),
          eq(workspaceMembers.status, "active"),
        ),
      )
      .limit(1);
    if (!membership) {
      return Response.json({ error: "Workspace invitation required." }, { status: 403 });
    }
    const rows = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt), desc(projects.id))
      .limit(100);
    if (membership.role === "administrator") {
      return Response.json({ projects: rows });
    }
    const assignments = await db
      .select({ projectId: projectMembers.projectId, role: projectMembers.role })
      .from(projectMembers)
      .where(eq(projectMembers.email, email));
    const access = new Map(assignments.map((item) => [item.projectId, item.role]));
    return Response.json({
      projects: rows
        .filter((project) => project.createdBy === email || access.has(project.id))
        .map((project) => ({ ...project, accessRole: access.get(project.id) ?? "owner" })),
    });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getWorkspaceUser();
    if (!user) {
      return Response.json(
        { error: "Sign in to create a saved project." },
        { status: 401 },
      );
    }
    const createdBy = user.email.toLowerCase();
    const db = await getDb();
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.email, createdBy),
          eq(workspaceMembers.status, "active"),
        ),
      )
      .limit(1);
    if (!membership || !["administrator", "manager"].includes(membership.role)) {
      return Response.json(
        { error: "Your role cannot create projects." },
        { status: 403 },
      );
    }

    const payload = (await request.json()) as {
      name?: string;
      department?: string;
      priority?: string;
      description?: string;
    };
    const name = payload.name?.trim() ?? "";
    if (!name) {
      return Response.json({ error: "Project name is required." }, { status: 400 });
    }

    const [project] = await db
      .insert(projects)
      .values({
        name: name.slice(0, 120),
        department: payload.department?.trim().slice(0, 80) || "Product & Engineering",
        priority: payload.priority?.trim().slice(0, 20) || "High",
        description: payload.description?.trim().slice(0, 1000) || "",
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    await db.insert(projectMembers).values({
      projectId: project.id,
      email: createdBy,
      role: "owner",
      addedBy: createdBy,
    });
    await db.insert(approvalRequests).values({
      projectId: project.id,
      title: "Approve project operating baseline",
      category: "Delivery",
      requestedBy: createdBy,
    });
    await db.insert(accessAuditEvents).values({
      actorEmail: createdBy,
      action: "project.create",
      target: project.name,
      detail: "Created a project and assigned owner access.",
    });

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
