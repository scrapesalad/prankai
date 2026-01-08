import { NextRequest, NextResponse } from "next/server";
import { paypalFetch } from "../../../../../../lib/paypal";

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const capture = await paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      body: "{}"
    });

    return NextResponse.json(capture);
  } catch (error) {
    return NextResponse.json({ error: "Failed to capture PayPal order." }, { status: 500 });
  }
}
