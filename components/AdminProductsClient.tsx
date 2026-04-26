"use client";

import { useMemo, useState } from "react";
import { adminStore, slugify } from "@/lib/admin-store";
import type { Product } from "@/data/products";

const emptyProduct: Product = {
  slug: "",
  title: "",
  category: "",
  species: "dog",
  price: 0,
  description: "",
  image: "/images/box-generic.svg",
  tag: "",
  rating: 5
};

const imagePresets = [
  "/images/dog-treats.svg",
  "/images/cat-toy.svg",
  "/images/paw-balm.svg",
  "/images/rope-toy.svg",
  "/images/cat-treats.svg",
  "/images/bandana.svg",
  "/images/box-generic.svg"
];

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function speciesLabel(species: Product["species"]) {
  if (species === "dog") return "Cao";
  if (species === "cat") return "Gato";
  return "Ambos";
}

export default function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>(() => adminStore.products.get());
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>(emptyProduct);
  const [message, setMessage] = useState("");

  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.title.localeCompare(b.title)), [products]);

  function saveProducts(next: Product[], text: string) {
    setProducts(next);
    adminStore.products.set(next);
    setMessage(text);
  }

  function startNew() {
    setEditing(null);
    setForm(emptyProduct);
    setMessage("");
  }

  function startEdit(product: Product) {
    setEditing(product);
    setForm(product);
    setMessage("");
  }

  function saveProduct() {
    const slug = form.slug || slugify(form.title);
    if (!slug || !form.title || !form.category) {
      setMessage("Preencha pelo menos nome, slug e categoria.");
      return;
    }

    const product = { ...form, slug, price: Number(form.price), rating: Number(form.rating) };
    const exists = products.some((item) => item.slug === slug);
    const next = exists ? products.map((item) => item.slug === slug ? product : item) : [...products, product];
    saveProducts(next, exists ? "Produto actualizado." : "Produto criado.");
    setEditing(product);
    setForm(product);
  }

  function deleteProduct(slug: string) {
    saveProducts(products.filter((item) => item.slug !== slug), "Produto removido.");
    startNew();
  }

  function resetProducts() {
    adminStore.products.reset();
    const next = adminStore.products.get();
    setProducts(next);
    startNew();
    setMessage("Produtos repostos.");
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Escolha um ficheiro de imagem.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setForm((current) => ({ ...current, image: result }));
        setMessage("Imagem adicionada ao produto.");
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Produtos</h2>
          <div className="text-muted">Crie, edite, remova e reponha produtos do catalogo.</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="admin-action-btn" onClick={startNew}>Novo produto</button>
          <button className="admin-action-btn" onClick={resetProducts}>Repor produtos</button>
        </div>
      </div>

      <div className="card-body">
        <div className="row g-3">
          <div className="col-xl-8">
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label fw-bold">Nome</label><input className="admin-form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: editing ? form.slug : slugify(event.target.value) })} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Slug</label><input className="admin-form-control" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></div>
              <div className="col-md-4"><label className="form-label fw-bold">Categoria</label><input className="admin-form-control" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></div>
              <div className="col-md-4"><label className="form-label fw-bold">Animal</label><select className="admin-form-control" value={form.species} onChange={(event) => setForm({ ...form, species: event.target.value as Product["species"] })}><option value="dog">Cao</option><option value="cat">Gato</option><option value="both">Ambos</option></select></div>
              <div className="col-md-2"><label className="form-label fw-bold">Preco</label><input className="admin-form-control" type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label fw-bold">Avaliacao</label><input className="admin-form-control" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Imagem</label><input className="admin-form-control" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="/images/produto.svg ou https://..." /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Carregar imagem</label><input className="admin-form-control" type="file" accept="image/*" onChange={(event) => handleImageFile(event.target.files?.[0])} /></div>
              <div className="col-12"><label className="form-label fw-bold">Imagens rapidas</label><div className="admin-image-presets">{imagePresets.map((image) => <button key={image} className={`admin-image-preset ${form.image === image ? "active" : ""}`} onClick={() => setForm({ ...form, image })}><img src={image} alt="" /></button>)}</div></div>
              <div className="col-12"><label className="form-label fw-bold">Etiqueta</label><input className="admin-form-control" value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} /></div>
              <div className="col-12"><label className="form-label fw-bold">Descricao</label><textarea className="admin-form-control" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
            </div>
          </div>

          <div className="col-xl-4">
            <div className="admin-product-preview">
              <span className="text-muted small fw-bold">Pre-visualizacao</span>
              <img src={form.image} alt="" />
              <h3>{form.title || "Nome do produto"}</h3>
              <p className="text-muted mb-2">{form.category || "Categoria"} | {speciesLabel(form.species)}</p>
              <p>{form.description || "Descricao do produto."}</p>
              <strong>{money(Number(form.price) || 0)}</strong>
            </div>
          </div>

          <div className="col-12 d-flex gap-2 flex-wrap">
            <button className="admin-action-btn admin-action-primary" onClick={saveProduct}>{editing ? "Guardar alteracoes" : "Criar produto"}</button>
            <button className="admin-action-btn" onClick={startNew}>Limpar</button>
          </div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>

      <div className="table-responsive">
        <table className="table admin-table admin-products-table">
          <thead><tr><th>Produto</th><th>Categoria</th><th>Animal</th><th>Preco</th><th>Avaliacao</th><th className="admin-actions-heading">Acoes</th></tr></thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr key={product.slug}>
                <td>
                  <div className="admin-product-cell">
                    <img src={product.image} alt="" />
                    <div><strong>{product.title}</strong><div className="text-muted small">/{product.slug}</div></div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{speciesLabel(product.species)}</td>
                <td className="fw-bold">{money(product.price)}</td>
                <td>{product.rating}</td>
                <td>
                  <div className="admin-table-actions">
                    <button className="admin-action-btn" onClick={() => startEdit(product)}>Editar</button>
                    <button className="admin-action-btn" onClick={() => deleteProduct(product.slug)}>Remover</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
