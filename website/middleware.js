// Edge 301s for the clean-slug migration. Reads a static snapshot of the
// Redirect table (lib/redirects.generated.json, refreshed at build by
// scripts/exportRedirects.js) so there's no DB call on the hot path.
//
// Covers: old /plans/<uniqueName> -> new /esim/... , and discontinued plans
// pointed at their country hub. Legacy query-param variants collapse to the
// path, which is what the map is keyed on.
import { NextResponse } from "next/server";
import redirects from "./lib/redirects.generated.json";

export const config = {
  // Only run where redirects can live; skip assets, api, and the new routes.
  matcher: ["/plans/:path*"],
};

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const hit = redirects[pathname];
  if (!hit) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = hit.to;
  url.search = ""; // drop legacy ?code/?days/?data — the target is self-contained
  return NextResponse.redirect(url, hit.status || 301);
}
