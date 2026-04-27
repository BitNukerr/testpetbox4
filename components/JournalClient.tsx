"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadAdminPosts } from "@/lib/admin-db";
import { adminStore, type EditablePost } from "@/lib/admin-store";

export default function JournalClient() {
  const [posts, setPosts] = useState<EditablePost[]>(() => adminStore.posts.get());

  useEffect(() => {
    const refresh = () => setPosts(adminStore.posts.get());
    refresh();
    loadAdminPosts()
      .then((items) => {
        if (items.length) {
          setPosts(items);
          adminStore.posts.set(items);
        }
      })
      .catch(() => null);
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  return (
    <div className="grid two">
      {posts.filter((post) => post.status === "Publicado").map((post) => (
        <Link href={`/journal/${post.slug}`} key={post.slug} className="card journal-card">
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
