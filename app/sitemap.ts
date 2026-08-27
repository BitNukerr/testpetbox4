import type { MetadataRoute } from "next";
import { products, journalPosts } from "@/data/products";
import { getCachedPostsState, getCachedProductsState } from "@/lib/site-data";

export const revalidate = 86400;

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const [publishedProducts, publishedPosts] = await Promise.all([
    getCachedProductsState(),
    getCachedPostsState()
  ]);
  const sitemapProducts = publishedProducts.loaded ? publishedProducts.data : products;
  const sitemapPosts = publishedPosts.loaded ? publishedPosts.data : journalPosts;
  const staticRoutes = ["", "/loja", "/criar-caixa", "/blog", "/sobre", "/contacto", "/entrar", "/legal/termos", "/legal/privacidade", "/legal/envios-devolucoes", "/legal/cookies"];
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...sitemapProducts.map((product) => ({ url: `${base}/produto/${product.slug}`, lastModified: new Date() })),
    ...sitemapPosts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: new Date() }))
  ];
}
