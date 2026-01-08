import { NextResponse } from "next/server";
import { getPayPalClientToken } from "../../../../lib/paypal";

export async function POST() {
  try {
    // Check environment variables
    const paypalEnv = process.env.PAYPAL_ENV || "sandbox";
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("PayPal credentials missing:", { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret,
        env: paypalEnv 
      });
      return NextResponse.json(
        { error: "PayPal credentials are not configured. Please check your environment variables." },
        { status: 500 }
      );
    }

    const clientToken = await getPayPalClientToken();
    
    // The getPayPalClientToken function now validates JWT format
    // If we get here, it's a valid JWT
    return NextResponse.json({ clientToken });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("PayPal client-token error:", errorMessage, error);
    return NextResponse.json(
      { error: `Failed to generate PayPal client token: ${errorMessage}` },
      { status: 500 }
    );
  }
}
