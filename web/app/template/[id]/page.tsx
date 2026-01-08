import type { Metadata } from "next";
import { templateById } from "../../../lib/templates";
import MascotHint from "../../../components/MascotHint";

type Params = { params: { id: string } };

export function generateMetadata({ params }: Params): Metadata {
  const template = templateById[params.id];
  if (!template) {
    return {
      title: "Template Not Found | Prank Dial AI",
      description: "This template does not exist."
    };
  }

  return {
    title: `${template.name} | Prank Dial AI`,
    description: template.tagline,
    openGraph: {
      title: template.name,
      description: template.tagline,
      type: "website"
    }
  };
}

export default function TemplatePage({ params }: Params) {
  const template = templateById[params.id];
  if (!template) {
    return (
      <div className="grid" style={{ gap: 16 }}>
        <h1>Template not found</h1>
        <p className="muted">Try browsing the gallery.</p>
        <a className="btn" href="/gallery">Go to gallery</a>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 24 }}>
      <header>
        <h1>{template.name}</h1>
        <p className="muted">{template.tagline}</p>
      </header>
      <MascotHint
        text="Pranklyn says: read the preview out loud. If it sounds odd, tweak the hook."
        image="/images/mascot/4qTGWF2-TSKMjaOMMPhtow.webp"
      />
      <section className="card">
        <h3>Preview</h3>
        <p className="muted">{template.systemPrompt || "Custom template starter."}</p>
        <p className="muted">{template.firstMessage}</p>
      </section>
      <a className="btn" href={`/?template=${template.id}`}>
        Use this template
      </a>
    </div>
  );
}
