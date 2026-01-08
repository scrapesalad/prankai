import type { Metadata } from "next";
import { leaderboardRows, computeMetrics } from "../../lib/analytics";
import { templateById } from "../../lib/templates";
import MascotHint from "../../components/MascotHint";

const baseUrl = "https://prankai.com";

export const metadata: Metadata = {
  title: "Trending Templates",
  description: "Top performing prank call templates this week.",
  alternates: {
    canonical: `${baseUrl}/trending`
  },
  openGraph: {
    title: "Trending Templates | Prank Dial AI",
    description: "Top performing prank call templates this week.",
    url: `${baseUrl}/trending`,
    images: ["/images/pranked.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Templates | Prank Dial AI",
    description: "Top performing prank call templates this week.",
    images: ["/images/pranked.png"]
  }
};

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;

const templateName = (call: any) => {
  const id = call?.metadata?.templateName || call?.assistant?.metadata?.templateName;
  return id && templateById[id] ? templateById[id].name : "Unknown";
};

const fetchCalls = async () => {
  if (!VAPI_API_KEY) return [];
  const response = await fetch("https://api.vapi.ai/call?page=1&pageSize=20", {
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!response.ok) return [];
  return response.json();
};

export default async function TrendingPage() {
  const calls = await fetchCalls();
  const metrics = computeMetrics(calls, templateName);
  const leaderboard = leaderboardRows(metrics);
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Trending Templates",
        item: `${baseUrl}/trending`
      }
    ]
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <header>
        <h1>Trending Templates</h1>
        <p className="muted">Based on recent calls. Update cadence follows new calls.</p>
      </header>
      <MascotHint
        text="Pranklyn says: borrow what works, then personalize the opening line."
        image="/images/mascot/M0rNa8HyTC2PGiZArFeDKQ.webp"
      />
      <section className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: 8 }}>Template</th>
              <th style={{ textAlign: "right", paddingBottom: 8 }}>Answer rate</th>
              <th style={{ textAlign: "right", paddingBottom: 8 }}>Hangup &lt;10s</th>
              <th style={{ textAlign: "right", paddingBottom: 8 }}>Avg duration</th>
              <th style={{ textAlign: "right", paddingBottom: 8 }}>Laugh events</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row) => (
              <tr key={row.template}>
                <td style={{ padding: "8px 0" }}>{row.template}</td>
                <td style={{ textAlign: "right" }}>{row.answerRate}%</td>
                <td style={{ textAlign: "right" }}>{row.hangupRate}%</td>
                <td style={{ textAlign: "right" }}>{row.avgDuration}s</td>
                <td style={{ textAlign: "right" }}>{row.laughEvents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
