import { NextResponse } from "next/server";
import { ClientResponseError } from "pocketbase";
import { getAdminPocketBase } from "@/lib/pocketbaseAdmin";

interface InviteWithInviter {
  used_by: string;
  expires_at: string;
  expand?: { created_by?: { name?: string; email?: string } };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const pb = await getAdminPocketBase();

  let invite: InviteWithInviter;
  try {
    invite = await pb
      .collection("invites")
      .getFirstListItem<InviteWithInviter>(pb.filter("token = {:token}", { token }), {
        expand: "created_by",
      });
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return NextResponse.json({ valid: false, reason: "not_found" });
    }
    throw error;
  }

  if (invite.used_by) {
    return NextResponse.json({ valid: false, reason: "used" });
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ valid: false, reason: "expired" });
  }

  const inviterName = invite.expand?.created_by?.name || invite.expand?.created_by?.email || "";
  return NextResponse.json({ valid: true, inviterName });
}
