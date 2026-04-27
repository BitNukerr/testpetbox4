"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { loadAdminProducts } from "@/lib/admin-db";
import { adminStore } from "@/lib/admin-store";
import type { Product } from "@/data/products";

type SpeciesFilter = "all" | Product["species"];
type SortMode = "featured" | "price-asc" | "price-desc" | "rating";

function speciesMatches(product: Product, filter: SpeciesFilter) {
  if (filter === "all") return true;
  return product.species === filter || product.species === "both";
}

const categoryIcons: Record<string, string> = {
  Todos: "✦",
  Snacks: "◐",
  Brinquedos: "◌",
  Cuidado: "✚",
  Acessorios: "◇",
  "Acessórios": "◇"
};

export default function ShopClient() {
  const [items, setItems] = useState<Product[]>(() => adminStore.products.get());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [species, setSpecies] = useState<SpeciesFilter>("all");
  const [sort, setSort] = useState<SortMode>("featured");

  useEffect(() => {
    const refresh = () => setItems(adminStore.products.get());
    refresh();
    loadAdminProducts()
      .then((products) => {
        if (products.length) {
          setItems(products);
          adminStore.products.set(products);
        }
      })
      .catch(() => null);
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(items.map((item) => item.category))).sort()], [items]);

  const filtered = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const next = items.filter((product) => {
      const matchesQuery = !cleanQuery || `${product.title} ${product.description} ${product.category} ${product.tag}`.toLowerCase().includes(cleanQuery);
      const matchesCategory = category === "Todos" || product.category === category;
      return matchesQuery && matchesCategory && speciesMatches(product, species);
    });

    if (sort === "price-asc") return [...next].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...next].sort((a, b) => b.price - a.price);
    if (sort === "rating") return [...next].sort((a, b) => b.rating - a.rating);
    return next;
  }, [category, items, query, sort, species]);

  return (
    <div className="shop-layout">
      <aside className="shop-filters">
        <div className="filter-head">
          <div><span className="tag">Filtros</span><h2>Encontrar produto</h2></div>
          <button className="link-btn" onClick={() => { setQuery(""); setCategory("Todos"); setSpecies("all"); setSort("featured"); }}>Limpar</button>
        </div>
        <label className="filter-search"><span>Pesquisar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="snacks, brinquedos..." /></label>
        <div className="filter-group">
          <span>Categoria</span>
          <div className="filter-options">
            {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}><b>{categoryIcons[item] || "•"}</b>{item}</button>)}
          </div>
        </div>
        <div className="filter-group">
          <span>Animal</span>
          <div className="filter-options compact">
            <button className={species === "all" ? "active" : ""} onClick={() => setSpecies("all")}><b>✦</b>Todos</button>
            <button className={species === "dog" ? "active" : ""} onClick={() => setSpecies("dog")}><b>♧</b>Cao</button>
            <button className={species === "cat" ? "active" : ""} onClick={() => setSpecies("cat")}><b>◌</b>Gato</button>
            <button className={species === "both" ? "active" : ""} onClick={() => setSpecies("both")}><b>◇</b>Cao + gato</button>
          </div>
        </div>
        <div className="filter-group">
          <span>Ordenar</span>
          <div className="filter-options compact">
            <button className={sort === "featured" ? "active" : ""} onClick={() => setSort("featured")}><b>★</b>Destaques</button>
            <button className={sort === "rating" ? "active" : ""} onClick={() => setSort("rating")}><b>↟</b>Melhor avaliacao</button>
            <button className={sort === "price-asc" ? "active" : ""} onClick={() => setSort("price-asc")}><b>€</b>Preco baixo</button>
            <button className={sort === "price-desc" ? "active" : ""} onClick={() => setSort("price-desc")}><b>€</b>Preco alto</button>
          </div>
        </div>
      </aside>

      <div>
        <div className="shop-toolbar">
          <p className="muted">{filtered.length} produto{filtered.length === 1 ? "" : "s"} encontrados</p>
        </div>
        {filtered.length ? <div className="grid three">{filtered.map((product) => <ProductCard key={product.slug} product={product} />)}</div> : <div className="card"><div className="card-body"><h2>Sem resultados</h2><p className="muted">Tente outra categoria, animal ou pesquisa.</p></div></div>}
      </div>
    </div>
  );
}
