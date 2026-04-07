import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    // Protect everything except:
    // - root path (/)
    // - _next internals
    // - static assets (favicon, svg, etc.)
    // - public marketing routes: /produit, /pricing, /contact
    // - auth page: /login
    // - API routes: /api/*
    "/((?!$|_next|favicon\\.ico|.*\\.svg|produit|pricing|contact|login|api).*)",
  ],
};
