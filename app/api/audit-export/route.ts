import { and, desc, eq, like } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { accessAuditEvents, workspaceMembers } from "../../../db/schema";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
    const email = user.email.toLowerCase();
    const db = await getDb();
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
    if (!membership || membership.role !== "administrator") {
      return Response.json(
        { error: "Only administrators can export the audit ledger." },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const risk = url.searchParams.get("risk");
    const query = url.searchParams.get("q")?.trim().slice(0, 80);
    const filters = [];
    if (risk && ["low", "medium", "high"].includes(risk)) {
      filters.push(eq(accessAuditEvents.risk, risk));
    }
    if (query) {
      filters.push(like(accessAuditEvents.action, `%${query}%`));
    }
    const events = await db
      .select()
      .from(accessAuditEvents)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(accessAuditEvents.createdAt))
      .limit(2000);
    const header = ["timestamp", "risk", "actor", "action", "target", "detail"];
    const rows = events.map((event) =>
      [
        event.createdAt,
        event.risk,
        event.actorEmail,
        event.action,
        event.target,
        event.detail,
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = [header.map(csvCell).join(","), ...rows].join("\n");
    const filename = `nexus-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    });
  } catch (error) {
    console.error("audit-export.GET", requestId, error);
    return Response.json(
      { error: "Audit export failed.", requestId },
      { status: 500, headers: { "x-request-id": requestId } },
    );
  }
}
