"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { loadAdminProducts } from "@/lib/admin-db";
import { adminStore } from "@/lib/admin-store";

export default function HomeFeaturedProductsClient() {
  const [products, setProducts] = useState<Product[]>(() => adminStore.products.get());

  useEffect(() => {
    const refresh = () => setProducts(adminStore.products.get());
    refresh();
    loadAdminProducts()
      .then((items) => {
        if (items.length) {
          setProducts(items);
          adminStore.products.set(items);
        }
      })
      .catch(() => null);
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  return <div className="grid three">{products.slice(0, 3).map((product) => <ProductCard key={product.slug} product={product} />)}</div>;
}
