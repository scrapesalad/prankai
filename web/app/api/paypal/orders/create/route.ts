import { NextRequest, NextResponse } from "next/server";
import { paypalFetch } from "../../../../../lib/paypal";

type PlanId = "daily" | "weekly" | "monthly";

const PLAN_CONFIG: Record<
  PlanId,
  { description: string; amount: string; calls: number; durationDays: number }
> = {
  daily: {
    description: "PrankAI Daily Pass - 10 Calls",
    amount: "4.99",
    calls: 10,
    durationDays: 1
  },
  weekly: {
    description: "PrankAI Weekly Pass - 50 Calls",
    amount: "14.99",
    calls: 50,
    durationDays: 7
  },
  monthly: {
    description: "PrankAI Monthly Pass - Unlimited Calls",
    amount: "29.99",
    calls: 999,
    durationDays: 30
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const plan = body?.plan as PlanId | undefined;

    if (!plan || !(plan in PLAN_CONFIG)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const config = PLAN_CONFIG[plan];

    const order = await paypalFetch("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: config.description,
            amount: {
              currency_code: "USD",
              value: config.amount
            }
          }
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING"
        }
      })
    });

    return NextResponse.json({
      orderId: order.id,
      plan,
      calls: config.calls,
      durationDays: config.durationDays
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create PayPal order." }, { status: 500 });
  }
}
