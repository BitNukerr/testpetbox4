import type { MetadataRoute } from "next";
import { products, journalPosts } from "@/data/products";
import { getCachedPosts, getCachedProducts } from "@/lib/site-data";

export const revalidate = 86400;

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const [publishedProducts, publishedPosts] = await Promise.all([
    getCachedProducts(),
    getCachedPosts()
  ]);
  const sitemapProducts = publishedProducts.length ? publishedProducts : products;
  const sitemapPosts = publishedPosts.length ? publishedPosts : journalPosts;
  const staticRoutes = ["", "/loja", "/criar-caixa", "/blog", "/sobre", "/contacto", "/entrar", "/legal/termos", "/legal/privacidade", "/legal/envios-devolucoes", "/legal/cookies"];
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...sitemapProducts.map((product) => ({ url: `${base}/produto/${product.slug}`, lastModified: new Date() })),
    ...sitemapPosts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: new Date() }))
  ];
}
