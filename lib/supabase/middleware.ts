import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No Supabase project configured yet (e.g. local dev before the
  // project is provisioned) — pass through instead of crashing every page.
  if (!url || !anonKey) return supabaseResponse;

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // Refreshes the session cookie if expired. Required before any
    // Server Component reads the session, otherwise it can appear logged out.
    await supabase.auth.getUser();
  } catch {
    // A transient auth-refresh failure shouldn't take the whole site down —
    // worst case the request just renders as logged-out.
  }

  return supabaseResponse;
}
