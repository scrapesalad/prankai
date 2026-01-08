// lib/purchase.ts
// Client-side purchase tracking

export type Purchase = {
  orderId: string;
  plan: "daily" | "weekly" | "monthly";
  calls: number;
  callsUsed: number;
  purchasedAt: string;
  expiresAt: string;
};

export function getPurchase(): Purchase | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("prankai.purchase");
  if (!raw) return null;

  try {
    const purchase = JSON.parse(raw) as Purchase;

    // Check if expired
    if (new Date(purchase.expiresAt) < new Date()) {
      localStorage.removeItem("prankai.purchase");
      return null;
    }

    // Initialize callsUsed if not present
    if (typeof purchase.callsUsed !== "number") {
      purchase.callsUsed = 0;
      localStorage.setItem("prankai.purchase", JSON.stringify(purchase));
    }

    return purchase;
  } catch {
    return null;
  }
}

export function getRemainingCalls(): number {
  const purchase = getPurchase();
  if (!purchase) return 0;

  const remaining = purchase.calls - purchase.callsUsed;
  return Math.max(0, remaining);
}

export function hasPurchasedCalls(): boolean {
  return getRemainingCalls() > 0;
}

export function useCall(): boolean {
  const purchase = getPurchase();
  if (!purchase) return false;

  const remaining = getRemainingCalls();
  if (remaining <= 0) return false;

  purchase.callsUsed = (purchase.callsUsed || 0) + 1;
  localStorage.setItem("prankai.purchase", JSON.stringify(purchase));

  return true;
}

export function getPurchaseExpiry(): Date | null {
  const purchase = getPurchase();
  if (!purchase) return null;
  return new Date(purchase.expiresAt);
}

export function getPurchaseStatus(): {
  hasPurchase: boolean;
  remaining: number;
  total: number;
  plan: string | null;
  expiresAt: Date | null;
} {
  const purchase = getPurchase();

  if (!purchase) {
    return {
      hasPurchase: false,
      remaining: 0,
      total: 0,
      plan: null,
      expiresAt: null
    };
  }

  return {
    hasPurchase: true,
    remaining: getRemainingCalls(),
    total: purchase.calls,
    plan: purchase.plan,
    expiresAt: new Date(purchase.expiresAt)
  };
}
