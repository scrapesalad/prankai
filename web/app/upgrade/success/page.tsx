"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MascotHint from "../../../components/MascotHint";

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const planNames: Record<string, string> = {
    daily: "Daily Pass (10 Calls)",
    weekly: "Weekly Pass (50 Calls)",
    monthly: "Monthly Pass (Unlimited Calls)"
  };

  return (
    <div className="grid" style={{ gap: 24, maxWidth: 600, margin: "60px auto" }}>
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: 40,
          background: "linear-gradient(135deg, #2e86ff 0%, #43d4d8 100%)",
          color: "#fff"
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ margin: "0 0 12px", fontSize: 32 }}>Payment Successful!</h1>
        <p style={{ margin: 0, fontSize: 18, opacity: 0.9 }}>
          You've upgraded to {planNames[plan || "daily"] || "your new plan"}
        </p>
      </div>

      <div className="card">
        <h2>What's Next?</h2>
        <MascotHint
          text="Pranklyn says: start with a short, friendly hook and keep the exit clean."
          image="/images/mascot/uvO5q40CRFOYaeRVd_6fTg.jpg"
        />
        <ol style={{ margin: "16px 0 0", paddingLeft: 20 }}>
          <li style={{ marginBottom: 12 }}>
            <strong>Head to the home page</strong> - Your calls are ready to use immediately
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>Pick a template</strong> - Choose from 67+ prank scenarios
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>Customize your prank</strong> - Add names, tweak the script
          </li>
          <li>
            <strong>Start calling!</strong> - Your upgraded calls are tracked automatically
          </li>
        </ol>
      </div>

      <div className="card" style={{ background: "#fff7e6", border: "1px solid #ffe06b" }}>
        <strong style={{ display: "block", marginBottom: 8 }}>📧 Receipt</strong>
        <p style={{ margin: 0, fontSize: 14, color: "#6d5e4f" }}>
          A payment confirmation has been sent to your PayPal email. Save this for your records.
        </p>
      </div>

      <div style={{ textAlign: "center", display: "grid", gap: 12 }}>
        <Link href="/" className="btn" style={{ display: "inline-block" }}>
          Start Pranking Now
        </Link>
        <Link
          href="/upgrade"
          style={{ fontSize: 14, color: "#6d5e4f", textDecoration: "none" }}
        >
          View all plans
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60 }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
