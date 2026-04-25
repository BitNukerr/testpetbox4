"use client";

import { useMemo, useState } from "react";
import { adminStore, slugify } from "@/lib/admin-store";
import type { Plan, Product } from "@/data/products";

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

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

export default function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>(() => adminStore.products.get());
  const [plans, setPlans] = useState<Plan[]>(() => adminStore.plans.get());
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

  function updatePlan(id: string, field: keyof Plan, value: string) {
    setPlans((current) => current.map((plan) => plan.id === id ? { ...plan, [field]: field === "price" ? Number(value) : value } : plan));
  }

  function savePlans() {
    adminStore.plans.set(plans);
    setMessage("Planos actualizados.");
  }

  function resetPlans() {
    adminStore.plans.reset();
    setPlans(adminStore.plans.get());
    setMessage("Planos repostos.");
  }

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="admin-card">
          <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
            <div>
              <h2 className="h4 mb-1">Produtos</h2>
              <div className="text-muted">Crie, edite, remova e reponha produtos do catálogo.</div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button className="admin-action-btn" onClick={startNew}>Novo produto</button>
              <button className="admin-action-btn" onClick={resetProducts}>Repor produtos</button>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label fw-bold">Nome</label><input className="admin-form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: editing ? form.slug : slugify(event.target.value) })} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Slug</label><input className="admin-form-control" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></div>
              <div className="col-md-4"><label className="form-label fw-bold">Categoria</label><input className="admin-form-control" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></div>
              <div className="col-md-4"><label className="form-label fw-bold">Animal</label><select className="admin-form-control" value={form.species} onChange={(event) => setForm({ ...form, species: event.target.value as Product["species"] })}><option value="dog">Cão</option><option value="cat">Gato</option><option value="both">Ambos</option></select></div>
              <div className="col-md-2"><label className="form-label fw-bold">Preço</label><input className="admin-form-control" type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label fw-bold">Avaliação</label><input className="admin-form-control" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Imagem</label><input className="admin-form-control" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Etiqueta</label><input className="admin-form-control" value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} /></div>
              <div className="col-12"><label className="form-label fw-bold">Descrição</label><textarea className="admin-form-control" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
              <div className="col-12 d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={saveProduct}>{editing ? "Guardar alterações" : "Criar produto"}</button><button className="admin-action-btn" onClick={startNew}>Limpar</button></div>
            </div>
            {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
          </div>
          <div className="table-responsive">
            <table className="table admin-table">
              <thead><tr><th>Produto</th><th>Categoria</th><th>Animal</th><th>Preço</th><th>Avaliação</th><th /></tr></thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.slug}>
                    <td><strong>{product.title}</strong><div className="text-muted small">/{product.slug}</div></td>
                    <td>{product.category}</td>
                    <td>{product.species === "dog" ? "Cão" : product.species === "cat" ? "Gato" : "Ambos"}</td>
                    <td className="fw-bold">{money(product.price)}</td>
                    <td>{product.rating}</td>
                    <td className="d-flex gap-2 justify-content-end"><button className="admin-action-btn" onClick={() => startEdit(product)}>Editar</button><button className="admin-action-btn" onClick={() => deleteProduct(product.slug)}>Remover</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="admin-card">
          <div className="card-header d-flex justify-content-between gap-3 flex-wrap"><div><h2 className="h5 mb-1">Planos activos</h2><div className="text-muted small">Edite nomes, preços e descrições dos planos.</div></div><div className="d-flex gap-2"><button className="admin-action-btn" onClick={savePlans}>Guardar planos</button><button className="admin-action-btn" onClick={resetPlans}>Repor planos</button></div></div>
          <div className="row g-3 p-3">
            {plans.map((plan) => (
              <div className="col-md-6" key={plan.id}>
                <div className="border rounded-4 p-4 bg-white h-100">
                  <label className="form-label fw-bold">Nome</label><input className="admin-form-control mb-3" value={plan.name} onChange={(event) => updatePlan(plan.id, "name", event.target.value)} />
                  <label className="form-label fw-bold">Preço</label><input className="admin-form-control mb-3" type="number" value={plan.price} onChange={(event) => updatePlan(plan.id, "price", event.target.value)} />
                  <label className="form-label fw-bold">Descrição</label><textarea className="admin-form-control" rows={3} value={plan.description} onChange={(event) => updatePlan(plan.id, "description", event.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
