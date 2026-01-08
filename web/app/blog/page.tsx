import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Founder notes, prank call strategy, and ethical AI prank calling tips.",
  alternates: {
    canonical: "https://prankai.com/blog"
  },
  openGraph: {
    title: "Prank Dial AI Blog",
    description: "Founder notes, prank call strategy, and ethical AI prank calling tips.",
    url: "https://prankai.com/blog",
    images: ["/images/pranked.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Prank Dial AI Blog",
    description: "Founder notes, prank call strategy, and ethical AI prank calling tips.",
    images: ["/images/pranked.png"]
  }
};

const posts = [
  {
    title: "AI Prank Calls: The Right Way to Be Funny in 2026",
    href: "/blog/ai-prank-calls",
    description:
      "How voice AI prank calls keep the humor clever, ethical, and actually funny without crossing the line."
  },
  {
    title: "Prank Call Scripts That Actually Keep People on the Phone",
    href: "/blog/prank-call-scripts",
    description:
      "A founder-level breakdown of script structure, tone control, and how AI makes the jokes land longer."
  },
  {
    title: "Safe Prank Calling Tips: How to Be Funny Without Being a Jerk",
    href: "/blog/safe-prank-calling-tips",
    description:
      "Consent-aware, non-threatening, and still hilarious. Practical rules for ethical prank calling."
  },
  {
    title: "Prank Calling Tips: How to Pull Off Funny (Not Mean) Prank Calls in 2025",
    href: "/blog/prank-calling-tips-2025",
    description:
      "Beginner-friendly tips for funny, harmless prank calls with the right tone and timing."
  }
];

export default function BlogIndexPage() {
  const baseUrl = "https://prankai.com";
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
        name: "Blog",
        item: `${baseUrl}/blog`
      }
    ]
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <header>
        <h1>Prank Dial AI Blog</h1>
        <p className="muted">
          Founder notes, prank call science, and the ethics of staying funny without being weird about it.
        </p>
      </header>

      <section className="grid blog-list">
        {posts.map((post) => (
          <Link key={post.href} href={post.href} className="card blog-card">
            <h2>{post.title}</h2>
            <p className="muted">{post.description}</p>
            <span className="blog-cta">Read post</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
