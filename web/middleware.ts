import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const template = url.searchParams.get("template");
  if (template) {
    url.searchParams.delete("template");
    url.pathname = `/template/${template}`;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}
