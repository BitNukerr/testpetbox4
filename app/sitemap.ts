import type { MetadataRoute } from "next";
import { products, journalPosts } from "@/data/products";

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl();
  const staticRoutes = ["", "/shop", "/configure", "/journal", "/about", "/contact", "/login", "/legal/termos", "/legal/privacidade", "/legal/envios-devolucoes", "/legal/cookies"];
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...products.map((product) => ({ url: `${base}/product/${product.slug}`, lastModified: new Date() })),
    ...journalPosts.map((post) => ({ url: `${base}/journal/${post.slug}`, lastModified: new Date() }))
  ];
}
