import Link from "next/link";
import { journalPosts } from "@/data/products";
import { pt } from "@/lib/translations";

export default function JournalPage() {
  return (
    <section className="container section">
      <span className="eyebrow">{pt.nav.journal}</span>
      <h1>{pt.pages.journalTitle}</h1>
      <p className="muted">{pt.pages.journalIntro}</p>
      <div className="grid two top-gap">
        {journalPosts.map((post) => (
          <Link href={`/journal/${post.slug}`} key={post.slug} className="card journal-card">
            <div className="card-body"><span className="tag">{post.date}</span><h3>{post.title}</h3><p>{post.excerpt}</p></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
