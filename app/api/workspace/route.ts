import { and, desc, eq, sql } from "drizzle-orm";
import { getWorkspaceUser } from "../../session-auth";
import { getDb } from "../../../db";
import {
  accessAuditEvents,
  approvalRequests,
  projectMembers,
  projects,
  workspaceInvitations,
  workspaceMembers,
} from "../../../db/schema";

const workspaceRoles = ["administrator", "manager", "member", "viewer"] as const;
const projectRoles = ["owner", "manager", "contributor", "viewer"] as const;
const initialWorkspaceOwner =
  process.env.NEXUS_OWNER_EMAIL?.trim().toLowerCase() ?? "owner@nexus.local";
type WorkspaceRole = (typeof workspaceRoles)[number];
type ProjectRole = (typeof projectRoles)[number];

const permissionMap: Record<WorkspaceRole, string[]> = {
  administrator: [
    "workspace.manage",
    "members.invite",
    "roles.manage",
    "projects.create",
    "projects.assign",
    "approvals.decide",
    "budget.manage",
    "security.manage",
    "reports.export",
    "automation.manage",
    "integrations.manage",
    "enterprise.manage",
  ],
  manager: [
    "members.invite",
    "projects.create",
    "projects.assign",
    "approvals.decide",
    "budget.manage",
    "reports.export",
    "automation.manage",
  ],
  member: ["projects.update", "approvals.request", "tasks.manage", "reports.view"],
  viewer: ["projects.view", "reports.view"],
};

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function asWorkspaceRole(value: unknown): WorkspaceRole | null {
  return workspaceRoles.includes(value as WorkspaceRole)
    ? (value as WorkspaceRole)
    : null;
}

function asProjectRole(value: unknown): ProjectRole | null {
  return projectRoles.includes(value as ProjectRole)
    ? (value as ProjectRole)
    : null;
}

async function recordAudit(
  db: Awaited<ReturnType<typeof getDb>>,
  actorEmail: string,
  action: string,
  target: string,
  detail: string,
  risk = "low",
) {
  await db.insert(accessAuditEvents).values({
    actorEmail,
    action,
    target,
    detail,
    risk,
  });
}

async function resolveMembership() {
  const user = await getWorkspaceUser();
  if (!user) return { error: "Sign in to continue.", status: 401 as const };

  const email = user.email.toLowerCase();
  const db = await getDb();
  let [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.email, email))
    .limit(1);

  if (!membership) {
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(workspaceMembers);

    if (Number(total) === 0) {
      const [ownedProject] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.createdBy, email))
        .limit(1);
      if (ownedProject || email === initialWorkspaceOwner) {
        await db
          .insert(workspaceMembers)
          .values({
            email,
            displayName: user.displayName,
            role: "administrator",
          })
          .onConflictDoNothing();
        [membership] = await db
          .select()
          .from(workspaceMembers)
          .where(eq(workspaceMembers.email, email))
          .limit(1);
        if (membership) {
          await recordAudit(
            db,
            email,
            "workspace.bootstrap",
            "Nexus Labs",
            "Created the verified initial administrator account.",
            "medium",
          );
        }
      }
    } else {
      const [invitation] = await db
        .select()
        .from(workspaceInvitations)
        .where(
          and(
            eq(workspaceInvitations.email, email),
            eq(workspaceInvitations.status, "pending"),
          ),
        )
        .limit(1);

      if (invitation && new Date(invitation.expiresAt).getTime() > Date.now()) {
        await db
          .insert(workspaceMembers)
          .values({
            email,
            displayName: user.displayName,
            role: invitation.role,
          })
          .onConflictDoNothing();
        await db
          .update(workspaceInvitations)
          .set({ status: "accepted" })
          .where(eq(workspaceInvitations.id, invitation.id));
        if (invitation.projectId) {
          await db
            .insert(projectMembers)
            .values({
              projectId: invitation.projectId,
              email,
              role: invitation.projectRole,
              addedBy: invitation.invitedBy,
            })
            .onConflictDoNothing();
        }
        [membership] = await db
          .select()
          .from(workspaceMembers)
          .where(eq(workspaceMembers.email, email))
          .limit(1);
        await recordAudit(
          db,
          email,
          "invitation.accept",
          "Nexus Labs",
          `Accepted a ${invitation.role} workspace invitation.`,
        );
      }
    }
  }

  if (!membership) {
    return {
      error: "This account does not have access to the Nexus Labs workspace.",
      status: 403 as const,
      reason: "not_invited",
    };
  }
  if (membership.status !== "active") {
    return {
      error: "This workspace account is suspended. Contact an administrator.",
      status: 403 as const,
      reason: "suspended",
    };
  }

  return { user, email, db, membership };
}

async function seedOwnerAccess(
  db: Awaited<ReturnType<typeof getDb>>,
  email: string,
) {
  const ownedProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.createdBy, email));
  if (!ownedProjects.length) return;

  await db
    .insert(projectMembers)
    .values(
      ownedProjects.map((project) => ({
        projectId: project.id,
        email,
        role: "owner",
        addedBy: email,
      })),
    )
    .onConflictDoNothing();

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(approvalRequests);
  if (Number(total) === 0) {
    await db.insert(approvalRequests).values([
      {
        projectId: ownedProjects[0]?.id,
        title: "Approve production access policy",
        category: "Security",
        requestedBy: email,
      },
      {
        projectId: ownedProjects[1]?.id ?? ownedProjects[0]?.id,
        title: "Release milestone operating budget",
        category: "Finance",
        amount: 84000,
        requestedBy: email,
      },
    ]);
  }
}

export async function GET() {
  try {
    const resolved = await resolveMembership();
    if ("error" in resolved) {
      return Response.json(
        { error: resolved.error, reason: resolved.reason },
        { status: resolved.status },
      );
    }
    const { db, email, membership } = resolved;
    await seedOwnerAccess(db, email);

    const [members, assignments, approvals, audit] = await Promise.all([
      db.select().from(workspaceMembers).orderBy(workspaceMembers.displayName),
      db
        .select({
          id: projectMembers.id,
          projectId: projectMembers.projectId,
          projectName: projects.name,
          email: projectMembers.email,
          role: projectMembers.role,
        })
        .from(projectMembers)
        .innerJoin(projects, eq(projectMembers.projectId, projects.id))
        .orderBy(projects.name),
      db
        .select({
          id: approvalRequests.id,
          projectId: approvalRequests.projectId,
          projectName: projects.name,
          title: approvalRequests.title,
          category: approvalRequests.category,
          amount: approvalRequests.amount,
          status: approvalRequests.status,
          requestedBy: approvalRequests.requestedBy,
          createdAt: approvalRequests.createdAt,
        })
        .from(approvalRequests)
        .leftJoin(projects, eq(approvalRequests.projectId, projects.id))
        .orderBy(desc(approvalRequests.createdAt))
        .limit(20),
      db
        .select()
        .from(accessAuditEvents)
        .orderBy(desc(accessAuditEvents.createdAt))
        .limit(12),
    ]);

    const invitations =
      membership.role === "administrator" || membership.role === "manager"
        ? await db
            .select()
            .from(workspaceInvitations)
            .where(eq(workspaceInvitations.status, "pending"))
            .orderBy(desc(workspaceInvitations.createdAt))
        : [];

    return Response.json({
      membership,
      permissions: permissionMap[membership.role as WorkspaceRole] ?? [],
      members,
      invitations,
      projectMembers: assignments,
      approvals,
      audit,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Workspace access is unavailable." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const resolved = await resolveMembership();
    if ("error" in resolved) {
      return Response.json({ error: resolved.error }, { status: resolved.status });
    }
    const { db, email: actorEmail, membership } = resolved;
    const payload = (await request.json()) as Record<string, unknown>;
    const action = typeof payload.action === "string" ? payload.action : "";
    const isAdmin = membership.role === "administrator";
    const isManager = membership.role === "manager";

    if (action === "invite") {
      if (!isAdmin && !isManager) {
        return Response.json({ error: "You cannot invite workspace members." }, { status: 403 });
      }
      const email = normalizeEmail(payload.email);
      const role = asWorkspaceRole(payload.role);
      const projectRole = asProjectRole(payload.projectRole) ?? "contributor";
      const projectId = Number(payload.projectId) || null;
      if (!validEmail(email) || !role) {
        return Response.json({ error: "Enter a valid email and role." }, { status: 400 });
      }
      if (email === actorEmail) {
        return Response.json({ error: "You already belong to this workspace." }, { status: 400 });
      }
      if (isManager && (role === "administrator" || role === "manager")) {
        return Response.json({ error: "Managers can invite members and viewers only." }, { status: 403 });
      }
      const [existing] = await db
        .select({ id: workspaceMembers.id })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.email, email))
        .limit(1);
      if (existing) {
        return Response.json({ error: "This person is already a workspace member." }, { status: 409 });
      }
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      await db
        .insert(workspaceInvitations)
        .values({
          email,
          role,
          projectId,
          projectRole,
          invitedBy: actorEmail,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: workspaceInvitations.email,
          set: {
            role,
            projectId,
            projectRole,
            status: "pending",
            invitedBy: actorEmail,
            expiresAt,
          },
        });
      await recordAudit(
        db,
        actorEmail,
        "member.invite",
        email,
        `Invited as ${role}${projectId ? ` with ${projectRole} project access` : ""}.`,
      );
      return Response.json({ ok: true });
    }

    if (action === "updateRole") {
      if (!isAdmin) {
        return Response.json({ error: "Only administrators can change workspace roles." }, { status: 403 });
      }
      const email = normalizeEmail(payload.email);
      const role = asWorkspaceRole(payload.role);
      if (!email || !role) {
        return Response.json({ error: "A valid member and role are required." }, { status: 400 });
      }
      if (email === actorEmail && role !== "administrator") {
        return Response.json({ error: "You cannot remove your own administrator access." }, { status: 400 });
      }
      await db
        .update(workspaceMembers)
        .set({ role })
        .where(eq(workspaceMembers.email, email));
      await recordAudit(db, actorEmail, "member.role_change", email, `Role changed to ${role}.`, "medium");
      return Response.json({ ok: true });
    }

    if (action === "suspend") {
      if (!isAdmin) {
        return Response.json({ error: "Only administrators can suspend members." }, { status: 403 });
      }
      const email = normalizeEmail(payload.email);
      if (!email || email === actorEmail) {
        return Response.json({ error: "You cannot suspend your own account." }, { status: 400 });
      }
      await db
        .update(workspaceMembers)
        .set({ status: "suspended" })
        .where(eq(workspaceMembers.email, email));
      await recordAudit(db, actorEmail, "member.suspend", email, "Workspace access suspended.", "high");
      return Response.json({ ok: true });
    }

    if (action === "assignProject") {
      if (!isAdmin && !isManager) {
        return Response.json({ error: "You cannot assign project access." }, { status: 403 });
      }
      const email = normalizeEmail(payload.email);
      const role = asProjectRole(payload.projectRole);
      const projectId = Number(payload.projectId);
      if (!email || !role || !Number.isInteger(projectId) || projectId < 1) {
        return Response.json({ error: "Choose a valid member, project, and project role." }, { status: 400 });
      }
      if (isManager) {
        const [managerAccess] = await db
          .select({ id: projectMembers.id })
          .from(projectMembers)
          .where(
            and(
              eq(projectMembers.projectId, projectId),
              eq(projectMembers.email, actorEmail),
              sql`${projectMembers.role} in ('owner', 'manager')`,
            ),
          )
          .limit(1);
        if (!managerAccess) {
          return Response.json({ error: "Managers can assign access only on projects they manage." }, { status: 403 });
        }
      }
      const [targetMember] = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.email, email),
            eq(workspaceMembers.status, "active"),
          ),
        )
        .limit(1);
      if (!targetMember) {
        return Response.json({ error: "Invite this person to the workspace first." }, { status: 400 });
      }
      await db
        .insert(projectMembers)
        .values({ projectId, email, role, addedBy: actorEmail })
        .onConflictDoUpdate({
          target: [projectMembers.projectId, projectMembers.email],
          set: { role, addedBy: actorEmail },
        });
      await recordAudit(db, actorEmail, "project.access_change", email, `Assigned ${role} access to project ${projectId}.`, "medium");
      return Response.json({ ok: true });
    }

    if (action === "decideApproval") {
      if (!isAdmin && !isManager) {
        return Response.json({ error: "You cannot decide approval requests." }, { status: 403 });
      }
      const approvalId = Number(payload.approvalId);
      const decision = payload.decision === "approved" || payload.decision === "rejected"
        ? payload.decision
        : null;
      if (!Number.isInteger(approvalId) || !decision) {
        return Response.json({ error: "Choose a valid approval decision." }, { status: 400 });
      }
      await db
        .update(approvalRequests)
        .set({
          status: decision,
          decidedBy: actorEmail,
          decidedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(approvalRequests.id, approvalId),
            eq(approvalRequests.status, "pending"),
          ),
        );
      await recordAudit(db, actorEmail, `approval.${decision}`, `approval:${approvalId}`, `Approval request ${decision}.`, "medium");
      return Response.json({ ok: true });
    }

    if (action === "revokeInvite") {
      if (!isAdmin && !isManager) {
        return Response.json({ error: "You cannot revoke invitations." }, { status: 403 });
      }
      const invitationId = Number(payload.invitationId);
      await db
        .update(workspaceInvitations)
        .set({ status: "revoked" })
        .where(
          and(
            eq(workspaceInvitations.id, invitationId),
            eq(workspaceInvitations.status, "pending"),
          ),
        );
      await recordAudit(db, actorEmail, "invitation.revoke", `invitation:${invitationId}`, "Pending invitation revoked.");
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown workspace command." }, { status: 400 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "The workspace command failed." },
      { status: 500 },
    );
  }
}
