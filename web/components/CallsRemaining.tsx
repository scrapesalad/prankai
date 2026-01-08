// components/CallsRemaining.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPurchaseStatus } from "../lib/purchase";

export default function CallsRemaining() {
  const [status, setStatus] = useState({
    hasPurchase: false,
    remaining: 2,
    total: 2,
    plan: null as string | null,
    expiresAt: null as Date | null
  });

  useEffect(() => {
    const updateStatus = () => {
      const purchaseStatus = getPurchaseStatus();
      if (purchaseStatus.hasPurchase) {
        setStatus(purchaseStatus);
      } else {
        setStatus({
          hasPurchase: false,
          remaining: 2,
          total: 2,
          plan: null,
          expiresAt: null
        });
      }
    };

    updateStatus();

    // Listen for storage changes (when calls are used)
    window.addEventListener("storage", updateStatus);
    return () => window.removeEventListener("storage", updateStatus);
  }, []);

  const planNames: Record<string, string> = {
    daily: "Daily Pass",
    weekly: "Weekly Pass",
    monthly: "Monthly Pass"
  };

  if (!status.hasPurchase) {
    // Free tier
    return (
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(255, 224, 107, 0.2), rgba(67, 212, 216, 0.2))" }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2c4463", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Free Tier
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "4px 0" }}>2 Free Calls / Day</div>
            <p style={{ margin: 0, fontSize: 13, color: "#6d5e4f" }}>
              Resets daily. Want more calls?{" "}
              <Link href="/upgrade" style={{ color: "#2e86ff", fontWeight: 600 }}>
                Upgrade now
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Purchased tier
  const expiryDate = status.expiresAt ? status.expiresAt.toLocaleDateString() : "";
  const isUnlimited = status.plan === "monthly";

  return (
    <div className="card" style={{ background: "linear-gradient(135deg, rgba(46, 134, 255, 0.15), rgba(67, 212, 216, 0.15))" }}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2e86ff", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              {planNames[status.plan || ""] || "Premium"}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "4px 0" }}>
              {isUnlimited ? "Unlimited" : `${status.remaining} / ${status.total}`} Calls
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#6d5e4f" }}>Expires {expiryDate}</p>
          </div>
          {!isUnlimited && (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#2e86ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 18,
                fontWeight: 700
              }}
            >
              {status.remaining}
            </div>
          )}
        </div>

        {status.remaining <= 3 && !isUnlimited && (
          <div style={{ padding: 12, background: "rgba(255, 224, 107, 0.3)", borderRadius: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#4a3b2f" }}>
              ⚠️ Running low on calls.{" "}
              <Link href="/upgrade" style={{ color: "#2e86ff", fontWeight: 600 }}>
                Upgrade to get more
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
