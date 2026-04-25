"use client";

import Link from "next/link";
import { Product } from "@/data/products";
import { money } from "@/lib/helpers";
import { addToCart } from "@/lib/client-store";
import { pt } from "@/lib/translations";

const speciesLabel = { dog: "Cão", cat: "Gato", both: "Cão + gato" } as const;

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card product-card">
      <img src={product.image} alt={product.title} className="product-image" />
      <div className="card-body">
        <span className="tag">{product.tag}</span>
        <h3>{product.title}</h3>
        <p className="muted">{product.category} • {speciesLabel[product.species]}</p>
        <p>{product.description}</p>
        <div className="product-bottom">
          <strong>{money(product.price)}</strong>
          <div className="action-row">
            <button className="btn small" onClick={() => addToCart({ id: `${product.slug}-${Date.now()}`, slug: product.slug, title: product.title, price: product.price, quantity: 1, image: product.image, category: product.category, type: "product", species: product.species })}>{pt.common.addToCart}</button>
            <Link href={`/product/${product.slug}`} className="btn btn-secondary small">{pt.common.view}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
