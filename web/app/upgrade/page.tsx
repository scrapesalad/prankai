"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MascotHint from "../../components/MascotHint";

type PlanId = "daily" | "weekly" | "monthly";

const PLAN_DETAILS: Record<
  PlanId,
  {
    price: string;
    calls: number;
    durationDays: number;
    description: string;
    label: string;
    validity: string;
  }
> = {
  daily: {
    price: "4.99",
    calls: 10,
    durationDays: 1,
    description: "PrankAI Daily Pass - 10 Calls",
    label: "Daily Pass",
    validity: "Valid for 24 hours"
  },
  weekly: {
    price: "14.99",
    calls: 50,
    durationDays: 7,
    description: "PrankAI Weekly Pass - 50 Calls",
    label: "Weekly Pass",
    validity: "Valid for 7 days"
  },
  monthly: {
    price: "29.99",
    calls: 999,
    durationDays: 30,
    description: "PrankAI Monthly Pass - Unlimited Calls",
    label: "Monthly Pass",
    validity: "Valid for 30 days"
  }
};

export default function UpgradePage() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [paypalStatus, setPaypalStatus] = useState<"loading" | "ready" | "error">("loading");
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) {
      if (window.paypal) {
        setSdkLoaded(true);
      }
      return;
    }

    // Check if PayPal SDK is already loaded (from previous page load)
    if (window.paypal) {
      setSdkLoaded(true);
      scriptLoadedRef.current = true;
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="paypal.com/web-sdk"]');
    if (existingScript) {
      scriptLoadedRef.current = true;
      if (window.paypal) {
        setSdkLoaded(true);
      } else {
        existingScript.addEventListener('load', () => {
          setSdkLoaded(true);
        });
      }
      return;
    }

    // Load PayPal SDK v6
    scriptLoadedRef.current = true;
    const script = document.createElement("script");
    const paypalEnv = process.env.NEXT_PUBLIC_PAYPAL_ENV || "sandbox";
    script.src =
      paypalEnv === "live"
        ? "https://www.paypal.com/web-sdk/v6/core"
        : "https://www.sandbox.paypal.com/web-sdk/v6/core";
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => {
      setPaypalStatus("error");
      setPaypalError("Unable to load PayPal SDK. Please check your connection and try again.");
      scriptLoadedRef.current = false;
    };
    
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkLoaded || !window.paypal || initializedRef.current) return;
    initializedRef.current = true;

    const initializeButtons = async () => {
      try {
        // Fetch client token
        const clientTokenResponse = await fetch("/api/paypal/client-token", { method: "POST" });
        if (!clientTokenResponse.ok) {
          let errorData;
          try {
            errorData = await clientTokenResponse.json();
          } catch {
            const errorText = await clientTokenResponse.text();
            errorData = { error: errorText };
          }
          console.error("PayPal client token error:", errorData);
          throw new Error(errorData.error || `HTTP ${clientTokenResponse.status}: Unable to get PayPal client token`);
        }
        const tokenData = await clientTokenResponse.json();
        const clientToken = tokenData.clientToken;
        
        if (typeof clientToken !== "string" || !clientToken.length) {
          console.error("Invalid client token format:", tokenData);
          throw new Error("PayPal client token is missing or invalid.");
        }

        // Wait for PayPal SDK to be available
        const paypalSdk = window.paypal;
        if (!paypalSdk) {
          throw new Error("PayPal SDK not available. Please refresh the page.");
        }

        // Create SDK instance
        const sdkInstance = await paypalSdk.createInstance({
          clientToken,
          components: ["paypal-payments"],
          pageType: "checkout"
        });

        // Check eligibility
        const eligibleMethods = await sdkInstance.findEligibleMethods({ currencyCode: "USD" });
        if (!eligibleMethods.isEligible("paypal")) {
          setPaypalStatus("error");
          setPaypalError("PayPal is unavailable for your region or device.");
          return;
        }

        const setupButton = async (plan: PlanId) => {
          const button = document.querySelector(`paypal-button[data-plan="${plan}"]`);
          if (!button) return;

          const paymentSessionOptions = {
            async onApprove(data: { orderId: string }) {
              try {
                const captureResponse = await fetch(`/api/paypal/orders/${data.orderId}/capture`, {
                  method: "POST"
                });
                if (!captureResponse.ok) {
                  throw new Error("Failed to capture PayPal order.");
                }
                const orderData = await captureResponse.json();

                const planDetails = PLAN_DETAILS[plan];
                const purchase = {
                  orderId: orderData.id,
                  plan,
                  calls: planDetails.calls,
                  callsUsed: 0,
                  purchasedAt: new Date().toISOString(),
                  expiresAt: new Date(
                    Date.now() + planDetails.durationDays * 24 * 60 * 60 * 1000
                  ).toISOString()
                };
                localStorage.setItem("prankai.purchase", JSON.stringify(purchase));

                window.location.href = `/upgrade/success?plan=${plan}`;
              } catch (error) {
                console.error("Payment capture failed:", error);
                alert("Payment capture failed. Please contact support.");
              }
            },
            onCancel(data: any) {
              console.log("Payment cancelled:", data);
            },
            onError(error: any) {
              console.error("PayPal error:", error);
              alert("Payment failed. Please try again.");
            }
          };

          const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
            paymentSessionOptions
          );

          button.removeAttribute("hidden");
          button.addEventListener("click", async () => {
            try {
              await paypalPaymentSession.start({ presentationMode: "auto" }, createOrder(plan));
            } catch (error) {
              console.error("PayPal start error:", error);
              alert("Unable to start PayPal checkout. Please try again.");
            }
          });
        };

        const createOrder = async (plan: PlanId) => {
          const response = await fetch("/api/paypal/orders/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ plan })
          });
          if (!response.ok) {
            throw new Error("Unable to create PayPal order.");
          }
          const data = await response.json();
          return { orderId: data.orderId };
        };

        await Promise.all([setupButton("daily"), setupButton("weekly"), setupButton("monthly")]);
        setPaypalStatus("ready");
      } catch (error) {
        console.error("PayPal SDK initialization error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unable to initialize PayPal. Please try again later.";
        setPaypalStatus("error");
        setPaypalError(errorMessage);
      }
    };

    void initializeButtons();
  }, [sdkLoaded]);

  return (
    <div className="grid" style={{ gap: 32 }}>
      <section className="blog-header">
        <h1>Upgrade Your Plan</h1>
        <p className="blog-intro">Get more calls and unlock unlimited prank potential.</p>
      </section>
      <MascotHint
        text="Pranklyn says: pick the plan that matches how many friends you want to prank this week."
        image="/images/mascot/pcCg5WDRTPKzKEtQBkc2Xw.jpg"
      />

      <div className="grid" style={{ gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {/* Daily Pass */}
        <div className="card" style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2c4463", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Daily Pass
            </div>
            <h2 style={{ margin: "8px 0 4px", fontSize: 36, fontWeight: 700 }}>$4.99</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#6d5e4f" }}>Valid for 24 hours</p>
          </div>

          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14 }}>
            <li>10 prank calls</li>
            <li>All templates included</li>
            <li>Live listen enabled</li>
            <li>Call recording</li>
            <li>24 hour access</li>
          </ul>

          <paypal-button data-plan="daily" hidden></paypal-button>
          {paypalStatus === "loading" && <div className="btn" style={{ opacity: 0.5 }}>Loading PayPal...</div>}
          {paypalStatus === "error" && <div className="btn" style={{ opacity: 0.6 }}>{paypalError}</div>}
        </div>

        {/* Weekly Pass */}
        <div className="card" style={{ display: "grid", gap: 16, alignContent: "start", border: "2px solid #2e86ff" }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                background: "#2e86ff",
                padding: "4px 10px",
                borderRadius: 999,
                width: "fit-content",
                marginBottom: 8
              }}
            >
              Most Popular
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2c4463", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Weekly Pass
            </div>
            <h2 style={{ margin: "8px 0 4px", fontSize: 36, fontWeight: 700 }}>$14.99</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#6d5e4f" }}>Valid for 7 days</p>
          </div>

          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14 }}>
            <li>50 prank calls</li>
            <li>All templates included</li>
            <li>Live listen enabled</li>
            <li>Call recording</li>
            <li>7 day access</li>
            <li style={{ fontWeight: 700, color: "#2e86ff" }}>Save 40% vs daily</li>
          </ul>

          <paypal-button data-plan="weekly" hidden></paypal-button>
          {paypalStatus === "loading" && <div className="btn" style={{ opacity: 0.5 }}>Loading PayPal...</div>}
          {paypalStatus === "error" && <div className="btn" style={{ opacity: 0.6 }}>{paypalError}</div>}
        </div>

        {/* Monthly Pass */}
        <div className="card" style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2c4463", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Monthly Pass
            </div>
            <h2 style={{ margin: "8px 0 4px", fontSize: 36, fontWeight: 700 }}>$29.99</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#6d5e4f" }}>Valid for 30 days</p>
          </div>

          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14 }}>
            <li style={{ fontWeight: 700 }}>Unlimited calls</li>
            <li>All templates included</li>
            <li>Live listen enabled</li>
            <li>Call recording</li>
            <li>30 day access</li>
            <li style={{ fontWeight: 700, color: "#43d4d8" }}>Best value</li>
          </ul>

          <paypal-button data-plan="monthly" hidden></paypal-button>
          {paypalStatus === "loading" && <div className="btn" style={{ opacity: 0.5 }}>Loading PayPal...</div>}
          {paypalStatus === "error" && <div className="btn" style={{ opacity: 0.6 }}>{paypalError}</div>}
        </div>
      </div>

      <section className="card">
        <h3>Frequently Asked Questions</h3>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <strong>How do I use my purchased calls?</strong>
            <p style={{ margin: "4px 0 0", color: "#6d5e4f", fontSize: 14 }}>
              After payment, your calls are automatically added. Just go back to the home page and start pranking! Your
              remaining calls will be tracked automatically.
            </p>
          </div>
          <div>
            <strong>Do unused calls roll over?</strong>
            <p style={{ margin: "4px 0 0", color: "#6d5e4f", fontSize: 14 }}>
              No, calls expire at the end of your pass period (24 hours, 7 days, or 30 days depending on your plan).
            </p>
          </div>
          <div>
            <strong>Can I get a refund?</strong>
            <p style={{ margin: "4px 0 0", color: "#6d5e4f", fontSize: 14 }}>
              Due to the digital nature of the service, all sales are final. However, if you experience technical issues,
              contact us and we'll help resolve them.
            </p>
          </div>
          <div>
            <strong>Is payment secure?</strong>
            <p style={{ margin: "4px 0 0", color: "#6d5e4f", fontSize: 14 }}>
              Yes! All payments are processed securely through PayPal. We never store your payment information.
            </p>
          </div>
        </div>
      </section>

      <div style={{ textAlign: "center" }}>
        <Link href="/" className="btn">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
