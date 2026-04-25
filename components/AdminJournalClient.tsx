"use client";

import { useState } from "react";
import { adminStore, slugify, type EditablePost } from "@/lib/admin-store";

const emptyPost: EditablePost = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  author: "Equipa PetBox",
  date: new Date().toISOString().slice(0, 10),
  status: "Rascunho"
};

export default function AdminJournalClient() {
  const [posts, setPosts] = useState<EditablePost[]>(() => adminStore.posts.get());
  const [editing, setEditing] = useState<EditablePost | null>(null);
  const [form, setForm] = useState<EditablePost>(emptyPost);
  const [message, setMessage] = useState("");

  function save(next: EditablePost[], text: string) {
    setPosts(next);
    adminStore.posts.set(next);
    setMessage(text);
  }

  function startNew() {
    setEditing(null);
    setForm({ ...emptyPost, date: new Date().toISOString().slice(0, 10) });
    setMessage("");
  }

  function startEdit(post: EditablePost) {
    setEditing(post);
    setForm(post);
    setMessage("");
  }

  function savePost() {
    const slug = form.slug || slugify(form.title);
    if (!slug || !form.title || !form.body) {
      setMessage("Preencha título, slug e conteúdo.");
      return;
    }
    const post = { ...form, slug };
    const exists = posts.some((item) => item.slug === slug);
    const next = exists ? posts.map((item) => item.slug === slug ? post : item) : [post, ...posts];
    save(next, exists ? "Artigo actualizado." : "Artigo criado.");
    setEditing(post);
  }

  function deletePost(slug: string) {
    save(posts.filter((item) => item.slug !== slug), "Artigo removido.");
    startNew();
  }

  function resetPosts() {
    adminStore.posts.reset();
    setPosts(adminStore.posts.get());
    startNew();
    setMessage("Blog reposto.");
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div><h2 className="h4 mb-1">Blog</h2><div className="text-muted">Crie, edite, publique e remova artigos.</div></div>
        <div className="d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={startNew}>Novo artigo</button><button className="admin-action-btn" onClick={resetPosts}>Repor blog</button></div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-7"><label className="form-label fw-bold">Título</label><input className="admin-form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: editing ? form.slug : slugify(event.target.value) })} /></div>
          <div className="col-md-5"><label className="form-label fw-bold">Slug</label><input className="admin-form-control" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Autor</label><input className="admin-form-control" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Data</label><input className="admin-form-control" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Estado</label><select className="admin-form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EditablePost["status"] })}><option>Publicado</option><option>Rascunho</option></select></div>
          <div className="col-12"><label className="form-label fw-bold">Resumo</label><textarea className="admin-form-control" rows={2} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} /></div>
          <div className="col-12"><label className="form-label fw-bold">Conteúdo</label><textarea className="admin-form-control" rows={6} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></div>
          <div className="col-12 d-flex gap-2 flex-wrap"><button className="admin-action-btn" onClick={savePost}>{editing ? "Guardar artigo" : "Criar artigo"}</button><button className="admin-action-btn" onClick={startNew}>Limpar</button></div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>Título</th><th>Autor</th><th>Data</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug}>
                <td className="fw-bold">{post.title}<div className="text-muted small">/{post.slug}</div></td>
                <td>{post.author}</td>
                <td>{post.date}</td>
                <td><span className={`admin-pill ${post.status === "Publicado" ? "admin-pill-success" : "admin-pill-warning"}`}>{post.status}</span></td>
                <td className="d-flex justify-content-end gap-2"><button className="admin-action-btn" onClick={() => startEdit(post)}>Editar</button><button className="admin-action-btn" onClick={() => deletePost(post.slug)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
