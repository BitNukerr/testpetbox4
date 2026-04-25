"use client";

import { useEffect, useState } from "react";
import { adminStore } from "@/lib/admin-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";
import type { Product } from "@/data/products";

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProduct(adminStore.products.get().find((item) => item.slug === slug) || null);
  }, [slug]);

  if (!product) return <section className="container section narrow"><h1>Produto não encontrado</h1><a href="/shop" className="btn">Voltar à loja</a></section>;

  const species = product.species === "dog" ? pt.configure.dog : product.species === "cat" ? pt.configure.cat : pt.configure.both;

  return (
    <section className="container section">
      <div className="product-detail">
        <img src={product.image} alt={product.title} className="detail-image" />
        <div className="card"><div className="card-body"><span className="tag">{product.tag}</span><h1>{product.title}</h1><p className="muted">{product.category} | {species}</p><p>{product.description}</p><p className="price">{money(product.price)}</p><a href="/shop" className="btn">Voltar à loja</a></div></div>
      </div>
    </section>
  );
}
