import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prank Dial AI",
  description: "Prank call templates, live calling, and shareable voice AI experiences.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
