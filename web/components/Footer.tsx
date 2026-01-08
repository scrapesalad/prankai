// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "60px",
        paddingTop: "32px",
        paddingBottom: "32px",
        borderTop: "1px solid #e7dcc7",
        textAlign: "center"
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "16px",
          fontSize: "14px"
        }}
      >
        <Link href="/blog" style={{ color: "#4a3b2f", textDecoration: "none", fontWeight: 600 }}>
          Blog
        </Link>
        <Link href="/blog/ai-prank-calls" style={{ color: "#4a3b2f", textDecoration: "none", fontWeight: 600 }}>
          AI prank calls
        </Link>
        <Link href="/blog/prank-call-scripts" style={{ color: "#4a3b2f", textDecoration: "none", fontWeight: 600 }}>
          Prank call scripts
        </Link>
        <Link href="/blog/safe-prank-calling-tips" style={{ color: "#4a3b2f", textDecoration: "none", fontWeight: 600 }}>
          Safe prank calling tips
        </Link>
        <Link href="/gallery" style={{ color: "#4a3b2f", textDecoration: "none", fontWeight: 600 }}>
          Template gallery
        </Link>
        <Link href="/trending" style={{ color: "#4a3b2f", textDecoration: "none", fontWeight: 600 }}>
          Trending templates
        </Link>
        <Link href="/terms" style={{ color: "#4a3b2f", textDecoration: "none", fontWeight: 600 }}>
          Terms of Service
        </Link>
        <Link href="/privacy" style={{ color: "#4a3b2f", textDecoration: "none", fontWeight: 600 }}>
          Privacy Policy
        </Link>
      </div>
      <p style={{ margin: 0, fontSize: "13px", color: "#6d5e4f" }}>
        © {new Date().getFullYear()} Prank Dial AI. For entertainment purposes only. You must be 18+ and have consent
        to use this service.
      </p>
      <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#8a7a6b" }}>
        By using this service, you agree to comply with all applicable laws including TCPA and state recording consent
        laws.
      </p>
    </footer>
  );
}
