"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { loadAdminProducts } from "@/lib/admin-db";
import { adminStore } from "@/lib/admin-store";
import { addToCart } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";
import SmartImage from "@/components/SmartImage";

export default function ProductDetailClient({ slug, initialProducts = [], initialProductsLoaded = false }: { slug: string; initialProducts?: Product[]; initialProductsLoaded?: boolean }) {
  const authoritativeInitialProducts = initialProductsLoaded || initialProducts.length > 0;
  const [products, setProducts] = useState<Product[]>(() => authoritativeInitialProducts ? initialProducts : []);
  const [loaded, setLoaded] = useState(() => authoritativeInitialProducts);
  const [previewMode, setPreviewMode] = useState(false);
  const hasInitialProducts = authoritativeInitialProducts;

  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "admin";
    if (isPreview) {
      const refresh = () => {
        setProducts(adminStore.products.get());
        setLoaded(true);
      };
      setPreviewMode(true);
      refresh();
      window.addEventListener("petbox-admin-changed", refresh);
      return () => window.removeEventListener("petbox-admin-changed", refresh);
    }

    if (hasInitialProducts) {
      adminStore.products.set(initialProducts);
      setLoaded(true);
    } else {
      setProducts(adminStore.products.get());
    }

    if (hasInitialProducts) return;

    loadAdminProducts()
      .then((items) => setProducts(items))
      .catch(() => setProducts(adminStore.products.get()))
      .finally(() => setLoaded(true));
  }, []);

  const product = products.find((item) => item.slug === slug) || null;
  const related = useMemo(() => products.filter((item) => item.slug !== slug && (item.category === product?.category || item.species === product?.species || item.species === "both")).slice(0, 3), [product, products, slug]);

  if (!loaded) return null;

  if (!product) return <section className="container section narrow"><h1>Produto não encontrado</h1><Link href="/loja" className="btn">Voltar à loja</Link></section>;

  const species = product.species === "dog" ? pt.configure.dog : product.species === "cat" ? pt.configure.cat : pt.configure.both;

  return (
    <section className="container section">
      {previewMode ? <div className="preview-mode-banner">Pre-visualizacao local do admin. Os visitantes so veem isto depois de guardar.</div> : null}
      <div className="product-detail refined">
        <div className="detail-media-card"><SmartImage src={product.image} alt={product.title} className="detail-image" width={1000} height={1000} sizes="(max-width: 900px) 100vw, 55vw" priority /></div>
        <div className="card"><div className="card-body detail-buy-box">
          <span className="tag">{product.tag}</span>
          <h1>{product.title}</h1>
          <p className="muted">{product.category} | {species} | ★ {product.rating}</p>
          <p>{product.description}</p>
          <div className="trust-grid">
            <div><strong>Qualidade</strong><span>Seleção cuidada</span></div>
            <div><strong>Portugal</strong><span>Entrega em casa</span></div>
            <div><strong>Seguro</strong><span>Pagamento MB WAY</span></div>
          </div>
          <p className="price">{money(product.price)}</p>
          <div className="action-row wrap">
            <button className="btn" onClick={() => addToCart({ id: product.slug, slug: product.slug, title: product.title, price: product.price, quantity: 1, image: product.image, category: product.category, type: "product", species: product.species })}>Adicionar ao carrinho</button>
            <Link href="/loja" className="btn btn-secondary">Voltar à loja</Link>
          </div>
        </div></div>
      </div>

      {related.length ? (
        <section className="section">
          <div className="section-heading"><div><span className="eyebrow">Também pode gostar</span><h2>Produtos recomendados</h2></div></div>
          <div className="grid three">{related.map((item) => <ProductCard key={item.slug} product={item} />)}</div>
        </section>
      ) : null}
    </section>
  );
}
