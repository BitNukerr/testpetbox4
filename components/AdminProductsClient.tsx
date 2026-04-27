"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminImageField } from "@/components/AdminImageField";
import { deleteAdminProduct, loadAdminProductsForAdmin, saveAdminProduct } from "@/lib/admin-db";
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
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Product>(emptyProduct);
  const [message, setMessage] = useState("");

  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.title.localeCompare(b.title)), [products]);

  useEffect(() => {
    loadAdminProductsForAdmin()
      .then((items) => {
        if (items.length) {
          setProducts(items);
          adminStore.products.set(items);
        }
      })
      .catch(() => null);
  }, []);

  function saveProducts(next: Product[], text: string) {
    setProducts(next);
    adminStore.products.set(next);
    setMessage(text);
  }

  function startNew() {
    setEditing(null);
    setFormOpen(true);
    setForm(emptyProduct);
    setMessage("");
  }

  function startEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
    setForm(product);
    setMessage("");
  }

  async function saveProduct() {
    const slug = form.slug || slugify(form.title);
    if (!slug || !form.title || !form.category) {
      setMessage("Preencha pelo menos nome, slug e categoria.");
      return;
    }

    const product = { ...form, slug, price: Number(form.price), rating: Number(form.rating) };
    let savedProduct = product;
    let remoteSaved = true;
    try {
      savedProduct = await saveAdminProduct(product);
    } catch {
      remoteSaved = false;
    }
    const exists = products.some((item) => item.slug === slug);
    const next = exists ? products.map((item) => item.slug === slug ? savedProduct : item) : [...products, savedProduct];
    saveProducts(next, remoteSaved ? (exists ? "Produto actualizado." : "Produto criado.") : "Produto guardado localmente. Confirme que o Supabase/RLS esta configurado.");
    setEditing(savedProduct);
    setForm(savedProduct);
    setFormOpen(false);
  }

  async function deleteProduct(slug: string) {
    let remoteDeleted = true;
    try {
      await deleteAdminProduct(slug);
    } catch {
      remoteDeleted = false;
    }
    saveProducts(products.filter((item) => item.slug !== slug), remoteDeleted ? "Produto removido." : "Produto removido localmente. Confirme que o Supabase/RLS esta configurado.");
    startNew();
    setFormOpen(false);
  }

  function resetProducts() {
    adminStore.products.reset();
    const next = adminStore.products.get();
    setProducts(next);
    startNew();
    setFormOpen(false);
    setMessage("Produtos repostos.");
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

      {formOpen ? <div className="card-body">
        <div className="row g-3">
          <div className="col-xl-8">
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label fw-bold">Nome</label><input className="admin-form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: editing ? form.slug : slugify(event.target.value) })} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Slug</label><input className="admin-form-control" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></div>
              <div className="col-md-4"><label className="form-label fw-bold">Categoria</label><input className="admin-form-control" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></div>
              <div className="col-md-4"><label className="form-label fw-bold">Animal</label><select className="admin-form-control" value={form.species} onChange={(event) => setForm({ ...form, species: event.target.value as Product["species"] })}><option value="dog">Cao</option><option value="cat">Gato</option><option value="both">Ambos</option></select></div>
              <div className="col-md-2"><label className="form-label fw-bold">Preco</label><input className="admin-form-control" type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label fw-bold">Avaliacao</label><input className="admin-form-control" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} /></div>
              <div className="col-12"><label className="form-label fw-bold">Imagem</label><AdminImageField value={form.image} onChange={(image) => setForm({ ...form, image })} onMessage={setMessage} presets={imagePresets} options={{ width: 900, height: 900, fit: "contain" }} /></div>
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
            <button className="admin-action-btn" onClick={() => { setFormOpen(false); setEditing(null); setForm(emptyProduct); }}>Fechar</button>
          </div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div> : message ? <div className="card-body"><p className="text-muted mb-0">{message}</p></div> : null}

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
