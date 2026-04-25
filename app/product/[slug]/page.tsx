import ProductDetailClient from "@/components/ProductDetailClient";

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient slug={params.slug} />;
}
