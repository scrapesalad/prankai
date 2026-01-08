"use client";

import { useEffect, useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function UpgradePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD&intent=capture";
    script.async = true;
    script.onload = () => setLoading(false);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (loading || !window.paypal) return;

    // Daily Pass - 10 calls
    window.paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: "PrankAI Daily Pass - 10 Calls",
                amount: {
                  currency_code: "USD",
                  value: "4.99"
                },
                payee: {
                  email_address: "lafaverspam@gmail.com"
                }
              }
            ],
            application_context: {
              shipping_preference: "NO_SHIPPING"
            }
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          console.log("Payment successful:", order);

          // Store purchase in localStorage
          const purchase = {
            orderId: order.id,
            plan: "daily",
            calls: 10,
            purchasedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
          localStorage.setItem("prankai.purchase", JSON.stringify(purchase));

          window.location.href = "/upgrade/success?plan=daily";
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          alert("Payment failed. Please try again.");
        }
      })
      .render("#paypal-daily");

    // Weekly Pass - 50 calls
    window.paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: "PrankAI Weekly Pass - 50 Calls",
                amount: {
                  currency_code: "USD",
                  value: "14.99"
                },
                payee: {
                  email_address: "lafaverspam@gmail.com"
                }
              }
            ],
            application_context: {
              shipping_preference: "NO_SHIPPING"
            }
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          console.log("Payment successful:", order);

          const purchase = {
            orderId: order.id,
            plan: "weekly",
            calls: 50,
            purchasedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          };
          localStorage.setItem("prankai.purchase", JSON.stringify(purchase));

          window.location.href = "/upgrade/success?plan=weekly";
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          alert("Payment failed. Please try again.");
        }
      })
      .render("#paypal-weekly");

    // Monthly Pass - Unlimited
    window.paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: "PrankAI Monthly Pass - Unlimited Calls",
                amount: {
                  currency_code: "USD",
                  value: "29.99"
                },
                payee: {
                  email_address: "lafaverspam@gmail.com"
                }
              }
            ],
            application_context: {
              shipping_preference: "NO_SHIPPING"
            }
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          console.log("Payment successful:", order);

          const purchase = {
            orderId: order.id,
            plan: "monthly",
            calls: 999,
            purchasedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          localStorage.setItem("prankai.purchase", JSON.stringify(purchase));

          window.location.href = "/upgrade/success?plan=monthly";
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          alert("Payment failed. Please try again.");
        }
      })
      .render("#paypal-monthly");
  }, [loading]);

  return (
    <div className="grid" style={{ gap: 32 }}>
      <section className="blog-header">
        <h1>Upgrade Your Plan</h1>
        <p className="blog-intro">Get more calls and unlock unlimited prank potential.</p>
      </section>

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

          <div id="paypal-daily" style={{ marginTop: "auto" }}></div>
          {loading && <div className="btn" style={{ opacity: 0.5 }}>Loading PayPal...</div>}
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

          <div id="paypal-weekly" style={{ marginTop: "auto" }}></div>
          {loading && <div className="btn" style={{ opacity: 0.5 }}>Loading PayPal...</div>}
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

          <div id="paypal-monthly" style={{ marginTop: "auto" }}></div>
          {loading && <div className="btn" style={{ opacity: 0.5 }}>Loading PayPal...</div>}
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
