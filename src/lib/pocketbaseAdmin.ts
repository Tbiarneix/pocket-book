import PocketBase from "pocketbase";

const POCKETBASE_UPSTREAM_URL = process.env.POCKETBASE_UPSTREAM_URL;
const ADMIN_USER = process.env.NEXT_PRIVATE_ADMIN_USER;
const ADMIN_PASSWORD = process.env.NEXT_PRIVATE_ADMIN_MDP;

let client: PocketBase | null = null;
let authPromise: Promise<void> | null = null;

/**
 * Superuser-authenticated PocketBase client, for server-only routes that
 * must act outside the normal per-user API rules — e.g. validating an
 * invite token and creating the resulting account, which can't go through
 * the client SDK since `users.createRule` is locked down precisely to
 * force account creation through this path.
 */
export async function getAdminPocketBase(): Promise<PocketBase> {
  if (!POCKETBASE_UPSTREAM_URL || !ADMIN_USER || !ADMIN_PASSWORD) {
    throw new Error("Missing PocketBase admin configuration.");
  }

  if (!client) {
    client = new PocketBase(POCKETBASE_UPSTREAM_URL);
  }

  if (!client.authStore.isValid) {
    if (!authPromise) {
      authPromise = client
        .collection("_superusers")
        .authWithPassword(ADMIN_USER, ADMIN_PASSWORD)
        .then(() => {})
        .finally(() => {
          authPromise = null;
        });
    }
    await authPromise;
  }

  return client;
}
