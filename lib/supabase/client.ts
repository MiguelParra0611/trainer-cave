import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // @supabase/ssr defaults httpOnly:false because this browser client
      // needs document.cookie access to manage the session client-side —
      // that part can't be hardened without breaking auth. `secure` isn't
      // set by the library's defaults, so pin it explicitly in production.
      cookieOptions: { secure: process.env.NODE_ENV === "production" },
    },
  );
}
