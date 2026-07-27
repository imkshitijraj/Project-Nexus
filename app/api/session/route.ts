import { getWorkspaceUser } from "../../session-auth";

export async function GET() {
  const user = await getWorkspaceUser();
  return Response.json({ user });
}
