import { templates } from "../../lib/templates";
import CopyLink from "../../components/CopyLink";

export const metadata = {
  title: "Template Gallery | Prank Dial AI",
  description: "Browse prank call templates and share them."
};

export default function GalleryPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return (
    <div className="grid" style={{ gap: 24 }}>
      <header>
        <h1>Template Gallery</h1>
        <p className="muted">Indexable gallery for sharing prank templates.</p>
      </header>
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
