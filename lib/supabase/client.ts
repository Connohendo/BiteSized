import { createBrowserClient } from "@supabase/ssr";

function getAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) return "";
  try {
    const parts = key.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      ) as { role?: string };
      if (payload.role === "service_role") {
        throw new Error(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY is set to the service_role (secret) key. " +
            "Use the anon public key instead: Supabase Dashboard → Settings → API → anon public."
        );
      }
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("service_role")) throw e;
  }
  return key;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getAnonKey()
  );
}
