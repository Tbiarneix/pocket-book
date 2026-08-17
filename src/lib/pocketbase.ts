import PocketBase from "pocketbase";

const POCKETBASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

let client: PocketBase | null = null;

/**
 * Returns a singleton PocketBase client.
 *
 * On the client, the auth store is persisted to (and rehydrated from)
 * localStorage automatically by the SDK, so the session survives reloads.
 * On the server we always create a fresh instance to avoid leaking a
 * user's session across requests.
 */
export function getPocketBase(): PocketBase {
  if (typeof window === "undefined") {
    return new PocketBase(POCKETBASE_URL);
  }

  if (!client) {
    client = new PocketBase(POCKETBASE_URL);
    // The SDK auto-cancels an in-flight request when another one to the
    // same collection+method starts before it resolves — meant for
    // typeahead-style search-as-you-type. This app never relies on that,
    // and several screens (e.g. AddBooksWizard) fire off a few genuine,
    // unrelated requests to the same collection in quick succession, which
    // would otherwise get silently aborted.
    client.autoCancellation(false);
  }

  return client;
}
