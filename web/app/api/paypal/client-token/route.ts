import { NextResponse } from "next/server";
import { getPayPalClientToken } from "../../../../lib/paypal";

export async function POST() {
  try {
    const clientToken = await getPayPalClientToken();
    return NextResponse.json({ clientToken });
  } catch (error) {
    console.error("PayPal client-token error:", error);
    return NextResponse.json({ error: "Failed to generate PayPal client token." }, { status: 500 });
  }
}
