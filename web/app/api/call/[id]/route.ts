import { NextRequest, NextResponse } from "next/server";

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!VAPI_API_KEY) {
    return NextResponse.json({ error: "Missing Vapi credentials." }, { status: 500 });
  }

  const response = await fetch(`https://api.vapi.ai/call/${params.id}`, {
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data?.message || "Failed to fetch call." }, { status: response.status });
  }
  return NextResponse.json(data);
}
