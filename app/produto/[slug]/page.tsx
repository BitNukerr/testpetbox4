import ProductDetailClient from "@/components/ProductDetailClient";
import { products } from "@/data/products";
import { getCachedProductsState } from "@/lib/site-data";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productsState = await getCachedProductsState();
  const product = productsState.data.find((item) => item.slug === slug) || (!productsState.loaded ? products.find((item) => item.slug === slug) : null);
  if (!product) return { title: "Produto | PetBox" };

  return {
    title: `${product.title} | PetBox`,
    description: product.description,
    openGraph: {
      title: `${product.title} | PetBox`,
      description: product.description,
      images: [product.image]
    }
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productsState = await getCachedProductsState();

  return <ProductDetailClient slug={slug} initialProducts={productsState.data} initialProductsLoaded={productsState.loaded} />;
}
