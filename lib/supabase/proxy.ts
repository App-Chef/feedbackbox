import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isSupabaseConfigured } from "@/lib/env";

const PROTECTED_PREFIXES = ["/dashboard", "/reset-password"];
const AUTH_PAGES = ["/login", "/signup"];

export function routeDecision(pathname: string, signedIn: boolean): "allow" | "login" | "dashboard" {
  if (!signedIn && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return "login";
  }
  if (signedIn && AUTH_PAGES.includes(pathname)) return "dashboard";
  return "allow";
}

/** Refreshes the Supabase session cookie and guards dashboard routes. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const decision = routeDecision(request.nextUrl.pathname, signedIn);
  if (decision === "allow") return response;

  const url = request.nextUrl.clone();
  url.search = "";
  if (decision === "login") {
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  } else {
    url.pathname = "/dashboard";
  }
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}
