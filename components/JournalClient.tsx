"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadAdminPosts } from "@/lib/admin-db";
import { adminStore, type EditablePost } from "@/lib/admin-store";

function publishedPosts(posts: EditablePost[]) {
  return posts.filter((post) => post.status === "Publicado");
}

export default function JournalClient({ initialPosts = [], initialPostsLoaded = false }: { initialPosts?: EditablePost[]; initialPostsLoaded?: boolean }) {
  const authoritativeInitialPosts = initialPostsLoaded || initialPosts.length > 0;
  const [posts, setPosts] = useState<EditablePost[]>(() => authoritativeInitialPosts ? initialPosts : publishedPosts(adminStore.posts.get()));
  const hasInitialPosts = authoritativeInitialPosts;

  useEffect(() => {
    const refresh = () => setPosts(publishedPosts(adminStore.posts.get()));
    if (hasInitialPosts) {
      window.addEventListener("petbox-admin-changed", refresh);
      return () => window.removeEventListener("petbox-admin-changed", refresh);
    }

    refresh();
    loadAdminPosts()
      .then((items) => {
        const next = publishedPosts(items);
        setPosts(next);
      })
      .catch(() => null);
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  return (
    <div className="grid two">
      {posts.length === 0 ? (
        <div className="card"><div className="card-body"><h2>Sem artigos publicados</h2><p className="muted">Volte mais tarde para ler novidades da PetBox.</p></div></div>
      ) : null}
      {posts.map((post) => (
        <Link href={`/blog/${post.slug}`} key={post.slug} className="card journal-card">
          <div className="card-body">
            <span className="tag">{post.date}</span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
