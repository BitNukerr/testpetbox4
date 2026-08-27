import ProductDetailClient from "@/components/ProductDetailClient";
import { products } from "@/data/products";
import { getCachedProducts } from "@/lib/site-data";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
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
  const initialProducts = await getCachedProducts();

  return <ProductDetailClient slug={slug} initialProducts={initialProducts} />;
}
