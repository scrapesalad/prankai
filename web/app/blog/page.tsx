import Link from "next/link";

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
  }
];

export default function BlogIndexPage() {
  return (
    <div className="grid" style={{ gap: 24 }}>
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
