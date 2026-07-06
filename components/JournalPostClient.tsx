"use client";

import { useEffect, useState } from "react";
import BlogContent from "@/components/BlogContent";
import { loadAdminPosts } from "@/lib/admin-db";
import { adminStore, type EditablePost } from "@/lib/admin-store";

function findPost(posts: EditablePost[], slug: string, preview = false) {
  return posts.find((item) => item.slug === slug && (preview || item.status === "Publicado")) || null;
}

export default function JournalPostClient({ slug, initialPosts = [] }: { slug: string; initialPosts?: EditablePost[] }) {
  const [post, setPost] = useState<EditablePost | null>(() => findPost(initialPosts, slug));
  const [loaded, setLoaded] = useState(() => Boolean(initialPosts.length));
  const [previewMode, setPreviewMode] = useState(false);
  const hasInitialPosts = Boolean(initialPosts.length);

  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "admin";
    if (isPreview) {
      const refresh = () => {
        setPost(findPost(adminStore.posts.get(), slug, true));
        setLoaded(true);
      };
      setPreviewMode(true);
      refresh();
      window.addEventListener("petbox-admin-changed", refresh);
      return () => window.removeEventListener("petbox-admin-changed", refresh);
    }

    if (hasInitialPosts) return;

    loadAdminPosts()
      .then((posts) => setPost(findPost(posts.length ? posts : adminStore.posts.get(), slug)))
      .catch(() => setPost(findPost(adminStore.posts.get(), slug)))
      .finally(() => setLoaded(true));
  }, [hasInitialPosts, slug]);

  if (!loaded) return null;

  if (!post) return <section className="container section narrow"><h1>Artigo nao encontrado</h1><a href="/blog" className="btn">Voltar ao blog</a></section>;

  return <section className="container section narrow">{previewMode ? <div className="preview-mode-banner">Pre-visualizacao local do admin. Os visitantes so veem isto depois de publicar/guardar.</div> : null}<span className="eyebrow">{post.date}</span><h1>{post.title}</h1><p className="muted">{post.excerpt}</p><BlogContent body={post.body} /></section>;
}
