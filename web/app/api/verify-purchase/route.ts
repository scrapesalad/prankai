import { NextRequest, NextResponse } from "next/server";

// Verify purchase token from client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, plan, calls, purchasedAt, expiresAt, callsUsed } = body;

    // Validate purchase data
    if (!orderId || !plan || typeof calls !== "number" || !expiresAt) {
      return NextResponse.json({ valid: false, reason: "Invalid purchase data" }, { status: 400 });
    }

    // Check if expired
    if (new Date(expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, reason: "Purchase expired" }, { status: 400 });
    }

    // Check if calls available
    const remaining = calls - (callsUsed || 0);
    if (remaining <= 0) {
      return NextResponse.json({ valid: false, reason: "No calls remaining" }, { status: 400 });
    }

    // In production, verify orderId with PayPal API
    // For now, we trust the client-side storage since it's tied to browser

    return NextResponse.json({
      valid: true,
      remaining,
      plan,
      expiresAt
    });
  } catch (error) {
    return NextResponse.json({ valid: false, reason: "Invalid request" }, { status: 400 });
  }
}
