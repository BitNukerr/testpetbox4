import ProductDetailClient from "@/components/ProductDetailClient";
import { products } from "@/data/products";

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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <ProductDetailClient slug={slug} />;
}
