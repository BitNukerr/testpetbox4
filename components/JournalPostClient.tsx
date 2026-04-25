"use client";

import { useEffect, useState } from "react";
import BlogContent from "@/components/BlogContent";
import { adminStore, type EditablePost } from "@/lib/admin-store";

export default function JournalPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<EditablePost | null>(null);

  useEffect(() => {
    setPost(adminStore.posts.get().find((item) => item.slug === slug) || null);
  }, [slug]);

  if (!post) return <section className="container section narrow"><h1>Artigo nao encontrado</h1><a href="/journal" className="btn">Voltar ao blog</a></section>;

  return <section className="container section narrow"><span className="eyebrow">{post.date}</span><h1>{post.title}</h1><p className="muted">{post.excerpt}</p><BlogContent body={post.body} /></section>;
}
