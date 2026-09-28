import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets, the public widget script and the public widget API.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|widget.js|api/feedback|api/widget|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
