"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { adminStore } from "@/lib/admin-store";
import type { Product } from "@/data/products";

export default function ShopClient() {
  const [items, setItems] = useState<Product[]>(() => adminStore.products.get());

  useEffect(() => {
    const refresh = () => setItems(adminStore.products.get());
    refresh();
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  return <div className="grid three">{items.map((product) => <ProductCard key={product.slug} product={product} />)}</div>;
}
