"use client";

import { usePathname } from "next/navigation";

const tips = [
  "Keep it playful and believable. The best pranks sound like a real mix-up.",
  "Give the AI a clear persona. Names and roles make the script feel grounded.",
  "Short hooks win. One clean reason for the call is all you need.",
  "Stay kind on the escalation. Light urgency beats heavy pressure.",
  "Wrap it up fast. A polite exit keeps the laugh friendly.",
  "Test with a dry-run before dialing. It saves awkward edits later.",
  "Share the template when it hits. Good scripts deserve a second run.",
  "Consent first, always. It keeps Pranklyn approved and legal."
];

const images = [
  "/images/mascot/uvO5q40CRFOYaeRVd_6fTg.jpg",
  "/images/mascot/4qTGWF2-TSKMjaOMMPhtow.webp",
  "/images/mascot/8CXPHlLAQ4KMkxQv1u594Q.webp",
  "/images/mascot/fnYiHBrJQ_SJkaNxuVHOlg.webp",
  "/images/mascot/in-A3UI2SOaqPeoVXtYUww.jpg",
  "/images/mascot/M0rNa8HyTC2PGiZArFeDKQ.webp",
  "/images/mascot/mnMIvIQ3RWCPDFwRA_k-EA.jpg",
  "/images/mascot/pcCg5WDRTPKzKEtQBkc2Xw.jpg"
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export default function PranklynTipBar() {
  const pathname = usePathname() || "/";
  const index = hashString(pathname);
  const tip = tips[index % tips.length];
  const heroImage = images[index % images.length];

  return (
    <section className="pranklyn-tipbar">
      <div className="pranklyn-tipbar-card">
        <div className="pranklyn-tipbar-title">Pranklyn's tip</div>
        <p>{tip}</p>
      </div>
      <div className="pranklyn-tipbar-media">
        <img src={heroImage} alt="Pranklyn sharing a tip" />
        <div className="pranklyn-tipbar-avatars">
          {images.map((image) => (
            <img key={image} src={image} alt="Pranklyn mascot portrait" />
          ))}
        </div>
      </div>
    </section>
  );
}
