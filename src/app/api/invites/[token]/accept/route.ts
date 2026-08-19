import { NextResponse } from "next/server";
import { ClientResponseError } from "pocketbase";
import { getAdminPocketBase } from "@/lib/pocketbaseAdmin";

interface InviteRecord {
  id: string;
  used_by: string;
  expires_at: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nom, e-mail et mot de passe sont requis." },
      { status: 400 }
    );
  }

  const pb = await getAdminPocketBase();

  let invite: InviteRecord;
  try {
    invite = await pb
      .collection("invites")
      .getFirstListItem<InviteRecord>(pb.filter("token = {:token}", { token }));
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return NextResponse.json({ error: "Cette invitation n'existe pas." }, { status: 404 });
    }
    throw error;
  }

  if (invite.used_by) {
    return NextResponse.json(
      { error: "Cette invitation a déjà été utilisée." },
      { status: 410 }
    );
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Cette invitation a expiré." }, { status: 410 });
  }

  let user;
  try {
    user = await pb.collection("users").create({
      name,
      email,
      password,
      passwordConfirm: password,
      emailVisibility: false,
      verified: true,
    });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      const message = error.response?.data?.email?.message || "Impossible de créer le compte avec ces informations.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    throw error;
  }

  await pb.collection("invites").update(invite.id, {
    used_by: user.id,
    used_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
