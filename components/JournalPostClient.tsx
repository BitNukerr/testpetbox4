"use client";

import { useEffect, useState } from "react";
import BlogContent from "@/components/BlogContent";
import { loadAdminPosts } from "@/lib/admin-db";
import { adminStore, type EditablePost } from "@/lib/admin-store";

export default function JournalPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<EditablePost | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAdminPosts()
      .then((posts) => setPost((posts.length ? posts : adminStore.posts.get()).find((item) => item.slug === slug) || null))
      .catch(() => setPost(adminStore.posts.get().find((item) => item.slug === slug) || null))
      .finally(() => setLoaded(true));
  }, [slug]);

  if (!loaded) return null;

  if (!post) return <section className="container section narrow"><h1>Artigo nao encontrado</h1><a href="/blog" className="btn">Voltar ao blog</a></section>;

  return <section className="container section narrow"><span className="eyebrow">{post.date}</span><h1>{post.title}</h1><p className="muted">{post.excerpt}</p><BlogContent body={post.body} /></section>;
}
