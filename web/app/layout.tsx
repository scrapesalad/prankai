import "./globals.css";
import type { Metadata } from "next";
import PranklynTipBar from "../components/PranklynTipBar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Prank Dial AI",
    template: "%s | Prank Dial AI"
  },
  description: "Prank call templates, live calling, and shareable voice AI experiences.",
  metadataBase: new URL("https://prankai.com"),
  alternates: {
    canonical: "https://prankai.com"
  },
  openGraph: {
    title: "Prank Dial AI",
    description: "Prank call templates, live calling, and shareable voice AI experiences.",
    url: "https://prankai.com",
    siteName: "Prank Dial AI",
    type: "website",
    images: ["/images/pranked.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Prank Dial AI",
    description: "Prank call templates, live calling, and shareable voice AI experiences.",
    images: ["/images/pranked.png"]
  },
  icons: {
    icon: "/images/prank-dial-ai-logo.png",
    apple: "/images/prank-dial-ai-logo.png"
  },
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = "https://prankai.com";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Prank Dial AI",
    url: baseUrl,
    logo: `${baseUrl}/images/prank-dial-ai-logo.png`
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Prank Dial AI",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <main>
          <PranklynTipBar />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
