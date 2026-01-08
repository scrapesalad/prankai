import { NextRequest, NextResponse } from "next/server";

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;

export async function GET(request: NextRequest) {
  if (!VAPI_API_KEY) {
    return NextResponse.json({ error: "Missing Vapi credentials." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "10";

  const response = await fetch(`https://api.vapi.ai/call?page=${page}&pageSize=${pageSize}`, {
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data?.message || "Failed to fetch calls." }, { status: response.status });
  }
  return NextResponse.json(data);
}
