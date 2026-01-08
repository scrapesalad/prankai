import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const template = url.searchParams.get("template");

  let response: NextResponse;

  if (template) {
    url.searchParams.delete("template");
    url.pathname = `/template/${template}`;
    response = NextResponse.redirect(url, 308);
  } else {
    response = NextResponse.next();
  }

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.vapi.ai https://api-m.paypal.com https://api-m.sandbox.paypal.com; frame-src https://www.paypal.com https://www.sandbox.paypal.com; frame-ancestors 'none';"
  );

  return response;
}
