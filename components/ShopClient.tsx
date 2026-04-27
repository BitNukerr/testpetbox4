"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
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
        <div className="filter-control">
          <b>♧</b>
          <label><span>Animal</span><select value={species} onChange={(event) => setSpecies(event.target.value as SpeciesFilter)}><option value="all">Todos</option><option value="dog">Cao</option><option value="cat">Gato</option><option value="both">Cao + gato</option></select></label>
        </div>
        <div className="filter-control">
          <b>↕</b>
          <label><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="featured">Destaques</option><option value="rating">Melhor avaliacao</option><option value="price-asc">Preco mais baixo</option><option value="price-desc">Preco mais alto</option></select></label>
        </div>
      </aside>

      <div>
        <div className="shop-toolbar">
          <p className="muted">{filtered.length} produto{filtered.length === 1 ? "" : "s"} encontrados</p>
          <div className="shop-chips">
            {categories.slice(0, 5).map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </div>
        {filtered.length ? <div className="grid three">{filtered.map((product) => <ProductCard key={product.slug} product={product} />)}</div> : <div className="card"><div className="card-body"><h2>Sem resultados</h2><p className="muted">Tente outra categoria, animal ou pesquisa.</p></div></div>}
      </div>
    </div>
  );
}
