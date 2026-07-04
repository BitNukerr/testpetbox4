"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadAdminPosts } from "@/lib/admin-db";
import { adminStore, type EditablePost } from "@/lib/admin-store";

function publishedPosts(posts: EditablePost[]) {
  return posts.filter((post) => post.status === "Publicado");
}

export default function JournalClient({ initialPosts = [] }: { initialPosts?: EditablePost[] }) {
  const [posts, setPosts] = useState<EditablePost[]>(() => initialPosts.length ? initialPosts : publishedPosts(adminStore.posts.get()));
  const hasInitialPosts = Boolean(initialPosts.length);

  useEffect(() => {
    const refresh = () => setPosts(publishedPosts(adminStore.posts.get()));
    if (hasInitialPosts) {
      window.addEventListener("petbox-admin-changed", refresh);
      return () => window.removeEventListener("petbox-admin-changed", refresh);
    }

    refresh();
    loadAdminPosts()
      .then((items) => {
        if (items.length) {
          const next = publishedPosts(items);
          setPosts(next);
        }
      })
      .catch(() => null);
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  return (
    <div className="grid two">
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
