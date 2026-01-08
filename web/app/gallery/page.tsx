import type { Metadata } from "next";
import { templates } from "../../lib/templates";
import CopyLink from "../../components/CopyLink";
import MascotHint from "../../components/MascotHint";

const baseUrl = "https://prankai.com";

export const metadata: Metadata = {
  title: "Template Gallery",
  description: "Browse prank call templates and share them.",
  alternates: {
    canonical: `${baseUrl}/gallery`
  },
  openGraph: {
    title: "Template Gallery | Prank Dial AI",
    description: "Browse prank call templates and share them.",
    url: `${baseUrl}/gallery`,
    images: ["/images/pranked.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Template Gallery | Prank Dial AI",
    description: "Browse prank call templates and share them.",
    images: ["/images/pranked.png"]
  }
};

export default function GalleryPage() {
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
        name: "Template Gallery",
        item: `${baseUrl}/gallery`
      }
    ]
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <header>
        <h1>Template Gallery</h1>
        <p className="muted">Indexable gallery for sharing prank templates.</p>
      </header>
      <MascotHint
        text="Pranklyn says: pick a hook you can explain in one breath, then customize the names."
        image="/images/mascot/in-A3UI2SOaqPeoVXtYUww.jpg"
      />
      <section className="grid grid-2">
        {templates.map((template) => (
          <div className="card" key={template.id}>
            <h3>{template.name}</h3>
            <p className="muted">{template.tagline}</p>
            <a className="btn" href={`/template/${template.id}`}>
              Use template
            </a>
            <div style={{ marginTop: 12 }}>
              <CopyLink value={`${baseUrl}/template/${template.id}`} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
