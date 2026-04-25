import { journalPosts } from "@/data/products";
import { notFound } from "next/navigation";

export default function JournalPostPage({ params }: { params: { slug: string } }) {
  const post = journalPosts.find((item) => item.slug === params.slug);
  if (!post) return notFound();

  return (
    <section className="container section narrow">
      <span className="eyebrow">{post.date}</span>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </section>
  );
}
