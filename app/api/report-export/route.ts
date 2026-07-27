import { and, desc, eq, inArray, or } from "drizzle-orm";
import { getWorkspaceUser } from "../../session-auth";
import { getDb } from "../../../db";
import {
  approvalRequests,
  projectMembers,
  projects,
  tasks,
  workspaceMembers,
} from "../../../db/schema";

function ascii(value: unknown) {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfEscape(value: string) {
  return ascii(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function xmlEscape(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildPdf(lines: string[]) {
  const wrapped = lines.flatMap((line) => {
    const words = ascii(line).split(" ");
    const output: string[] = [];
    let current = "";
    for (const word of words) {
      if (`${current} ${word}`.trim().length > 86) {
        output.push(current);
        current = word;
      } else {
        current = `${current} ${word}`.trim();
      }
    }
    output.push(current);
    return output;
  });
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(wrapped.length / 45)) },
    (_, index) => wrapped.slice(index * 45, index * 45 + 45),
  );
  const objects: string[] = [];
  const pageIds = pages.map((_, index) => 4 + index * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pages.forEach((pageLines, index) => {
    const pageId = pageIds[index];
    const streamId = pageId + 1;
    const content = [
      "BT",
      "/F1 10 Tf",
      "52 792 Td",
      "14 TL",
      ...pageLines.map((line) => `(${pdfEscape(line)}) Tj T*`),
      "ET",
    ].join("\n");
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamId} 0 R >>`;
    objects[streamId] =
      `<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`;
  });
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = new TextEncoder().encode(body).length;
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = new TextEncoder().encode(body).length;
  body += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    body += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(body);
}

function cell(value: unknown, type: "String" | "Number" = "String") {
  return `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
}

function worksheet(name: string, rows: string[][], numericColumns = new Set<number>()) {
  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table>${rows
    .map(
      (row) =>
        `<Row>${row
          .map((value, index) =>
            cell(value, numericColumns.has(index) && !Number.isNaN(Number(value)) ? "Number" : "String"),
          )
          .join("")}</Row>`,
    )
    .join("")}</Table></Worksheet>`;
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const user = await getWorkspaceUser();
    if (!user) return Response.json({ error: "Sign in to export reports." }, { status: 401 });
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
    if (!membership || !["administrator", "manager"].includes(membership.role)) {
      return Response.json(
        { error: "Your workspace role cannot export enterprise reports." },
        { status: 403 },
      );
    }
    const accessible =
      membership.role === "administrator"
        ? await db.select().from(projects)
        : await db
            .selectDistinct({
              id: projects.id,
              name: projects.name,
              department: projects.department,
              health: projects.health,
              progress: projects.progress,
              budget: projects.budget,
              due: projects.due,
              createdBy: projects.createdBy,
              createdAt: projects.createdAt,
              priority: projects.priority,
              description: projects.description,
              color: projects.color,
            })
            .from(projects)
            .leftJoin(
              projectMembers,
              and(
                eq(projectMembers.projectId, projects.id),
                eq(projectMembers.email, email),
              ),
            )
            .where(or(eq(projects.createdBy, email), eq(projectMembers.email, email)));
    const projectIds = accessible.map((project) => project.id);
    const taskRows = projectIds.length
      ? await db
          .select({
            id: tasks.id,
            projectId: tasks.projectId,
            projectName: projects.name,
            title: tasks.title,
            status: tasks.status,
            priority: tasks.priority,
            assigneeEmail: tasks.assigneeEmail,
            dueDate: tasks.dueDate,
            updatedAt: tasks.updatedAt,
          })
          .from(tasks)
          .innerJoin(projects, eq(tasks.projectId, projects.id))
          .where(inArray(tasks.projectId, projectIds))
          .orderBy(desc(tasks.updatedAt))
      : [];
    const pending = projectIds.length
      ? await db
          .select({ id: approvalRequests.id })
          .from(approvalRequests)
          .where(
            and(
              eq(approvalRequests.status, "pending"),
              inArray(approvalRequests.projectId, projectIds),
            ),
          )
      : [];
    const done = taskRows.filter((task) => task.status === "done").length;
    const today = new Date().toISOString().slice(0, 10);
    const overdue = taskRows.filter(
      (task) => task.status !== "done" && task.dueDate && task.dueDate < today,
    ).length;
    const completionRate = taskRows.length
      ? Math.round((done / taskRows.length) * 100)
      : 0;
    const averageBudget = accessible.length
      ? Math.round(
          accessible.reduce((total, project) => total + project.budget, 0) /
            accessible.length,
        )
      : 0;
    const generatedAt = new Date().toISOString();
    const url = new URL(request.url);
    const format = url.searchParams.get("format") === "xls" ? "xls" : "pdf";

    if (format === "xls") {
      const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${worksheet(
  "Executive Summary",
  [
    ["Project Nexus Enterprise Report", generatedAt],
    ["Accessible projects", String(accessible.length)],
    ["Tracked tasks", String(taskRows.length)],
    ["Completion rate", String(completionRate)],
    ["Overdue tasks", String(overdue)],
    ["Pending approvals", String(pending.length)],
    ["Average budget utilization", String(averageBudget)],
  ],
  new Set([1]),
)}
${worksheet(
  "Projects",
  [
    ["Project", "Department", "Health", "Progress %", "Budget used %", "Due", "Priority"],
    ...accessible.map((project) => [
      project.name,
      project.department,
      project.health,
      String(project.progress),
      String(project.budget),
      project.due,
      project.priority,
    ]),
  ],
  new Set([3, 4]),
)}
${worksheet(
  "Tasks",
  [
    ["Project", "Task", "Status", "Priority", "Assignee", "Due", "Updated"],
    ...taskRows.map((task) => [
      task.projectName,
      task.title,
      task.status,
      task.priority,
      task.assigneeEmail ?? "Unassigned",
      task.dueDate ?? "",
      task.updatedAt,
    ]),
  ],
)}
</Workbook>`;
      return new Response(workbook, {
        headers: {
          "content-type": "application/vnd.ms-excel; charset=utf-8",
          "content-disposition": `attachment; filename="nexus-enterprise-report-${today}.xls"`,
          "cache-control": "no-store",
          "x-request-id": requestId,
        },
      });
    }

    const lines = [
      "PROJECT NEXUS - ENTERPRISE PORTFOLIO REPORT",
      `Generated: ${generatedAt}`,
      `Prepared for: ${user.displayName} (${membership.role})`,
      "",
      "EXECUTIVE SUMMARY",
      `Accessible projects: ${accessible.length}`,
      `Tracked tasks: ${taskRows.length}`,
      `Completion rate: ${completionRate}%`,
      `Overdue tasks: ${overdue}`,
      `Pending approvals: ${pending.length}`,
      `Average budget utilization: ${averageBudget}%`,
      "",
      "PROJECT PERFORMANCE",
      ...accessible.flatMap((project) => [
        `${project.name} | ${project.health} | ${project.progress}% complete | ${project.budget}% budget used | Due ${project.due}`,
        `Department: ${project.department} | Priority: ${project.priority}`,
      ]),
      "",
      "OPEN WORK",
      ...taskRows
        .filter((task) => task.status !== "done")
        .slice(0, 80)
        .map(
          (task) =>
            `${task.projectName} | ${task.title} | ${task.status} | ${task.priority} | ${task.assigneeEmail ?? "Unassigned"} | Due ${task.dueDate ?? "Not set"}`,
        ),
      "",
      "CONTROL STATEMENT",
      "This report is generated from identity-scoped Project Nexus records. Export access is audited and limited by workspace role.",
    ];
    return new Response(buildPdf(lines), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="nexus-enterprise-report-${today}.pdf"`,
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    });
  } catch (error) {
    console.error("report-export.GET", requestId, error);
    return Response.json(
      { error: "Report export failed.", requestId },
      { status: 500, headers: { "x-request-id": requestId } },
    );
  }
}
