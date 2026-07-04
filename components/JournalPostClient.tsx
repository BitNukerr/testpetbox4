"use client";

import { useEffect, useState } from "react";
import BlogContent from "@/components/BlogContent";
import { loadAdminPosts } from "@/lib/admin-db";
import { adminStore, type EditablePost } from "@/lib/admin-store";

function findPublishedPost(posts: EditablePost[], slug: string) {
  return posts.find((item) => item.slug === slug && item.status === "Publicado") || null;
}

export default function JournalPostClient({ slug, initialPosts = [] }: { slug: string; initialPosts?: EditablePost[] }) {
  const [post, setPost] = useState<EditablePost | null>(() => findPublishedPost(initialPosts, slug));
  const [loaded, setLoaded] = useState(() => Boolean(initialPosts.length));
  const hasInitialPosts = Boolean(initialPosts.length);

  useEffect(() => {
    if (hasInitialPosts) return;

    loadAdminPosts()
      .then((posts) => setPost(findPublishedPost(posts.length ? posts : adminStore.posts.get(), slug)))
      .catch(() => setPost(findPublishedPost(adminStore.posts.get(), slug)))
      .finally(() => setLoaded(true));
  }, [hasInitialPosts, slug]);

  if (!loaded) return null;

  if (!post) return <section className="container section narrow"><h1>Artigo nao encontrado</h1><a href="/blog" className="btn">Voltar ao blog</a></section>;

  return <section className="container section narrow"><span className="eyebrow">{post.date}</span><h1>{post.title}</h1><p className="muted">{post.excerpt}</p><BlogContent body={post.body} /></section>;
}
