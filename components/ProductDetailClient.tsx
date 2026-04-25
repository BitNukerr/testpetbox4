"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import { adminStore } from "@/lib/admin-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProduct(adminStore.products.get().find((item) => item.slug === slug) || null);
    setLoaded(true);
  }, [slug]);

  if (!loaded) return null;

  if (!product) return <section className="container section narrow"><h1>Produto nao encontrado</h1><a href="/shop" className="btn">Voltar a loja</a></section>;

  const species = product.species === "dog" ? pt.configure.dog : product.species === "cat" ? pt.configure.cat : pt.configure.both;

  return (
    <section className="container section">
      <div className="product-detail">
        <img src={product.image} alt={product.title} className="detail-image" />
        <div className="card"><div className="card-body"><span className="tag">{product.tag}</span><h1>{product.title}</h1><p className="muted">{product.category} | {species}</p><p>{product.description}</p><p className="price">{money(product.price)}</p><a href="/shop" className="btn">Voltar a loja</a></div></div>
      </div>
    </section>
  );
}
