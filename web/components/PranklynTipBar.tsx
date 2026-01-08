"use client";

import { usePathname } from "next/navigation";

const tips = [
  "Pranklyn says: keep it playful and believable. The best pranks sound like a real mix-up.",
  "Pranklyn says: give the AI a clear persona. Names and roles make the script feel grounded.",
  "Pranklyn says: short hooks win. One clean reason for the call is all you need.",
  "Pranklyn says: stay kind on the escalation. Light urgency beats heavy pressure.",
  "Pranklyn says: wrap it up fast. A polite exit keeps the laugh friendly.",
  "Pranklyn says: test with a dry-run before dialing. It saves awkward edits later.",
  "Pranklyn says: share the template when it hits. Good scripts deserve a second run.",
  "Pranklyn says: consent first, always. It keeps the fun legal and easy."
];

const blogTips = [
  "Pranklyn says: skim the bold headers first, then read the section you actually need.",
  "Pranklyn says: if a tip feels mean, rewrite it until it feels like a wink.",
  "Pranklyn says: structure beats shock. A tight arc is funnier than chaos.",
  "Pranklyn says: bookmark the ethics checklist. It keeps your jokes shareable."
];

const galleryTips = [
  "Pranklyn says: pick a template with a hook you can say in one breath.",
  "Pranklyn says: tap a template, then remix the hook to match your friend.",
  "Pranklyn says: share the template link when it lands. Good pranks repeat.",
  "Pranklyn says: keep the tone friendly; the gallery is built for laughs, not shocks."
];

const templateTips = [
  "Pranklyn says: read the preview out loud. If it sounds odd, tweak it.",
  "Pranklyn says: borrow the structure, then personalize the opening line.",
  "Pranklyn says: if the first message feels stiff, soften it before you call.",
  "Pranklyn says: use this template as a base, not a script you must follow."
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
  
  // Hide on homepage
  if (pathname === "/") {
    return null;
  }
  
  const index = hashString(pathname);
  const isBlogPost = pathname.startsWith("/blog/") && pathname.split("/").length > 2;
  const isBlogIndex = pathname === "/blog";
  const isGallery = pathname === "/gallery";
  const isTemplate = pathname.startsWith("/template/");
  const tipPool = isBlogIndex || isBlogPost ? blogTips : isGallery ? galleryTips : isTemplate ? templateTips : tips;
  const tip = tipPool[index % tipPool.length];
  const heroImage = images[index % images.length];

  return (
    <section className="pranklyn-tipbar">
      <div className="pranklyn-tipbar-card">
        <div className="pranklyn-tipbar-title">Pranklyn's tip</div>
        <p>{tip}</p>
      </div>
      <div className="pranklyn-tipbar-media">
        <img src={heroImage} alt="Pranklyn sharing a tip" />
      </div>
    </section>
  );
}
