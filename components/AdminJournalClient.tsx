"use client";

import { useEffect, useState } from "react";
import BlogContent from "@/components/BlogContent";
import { deleteAdminPost, loadAdminPostsForAdmin, saveAdminPost } from "@/lib/admin-db";
import { adminStore, slugify, type EditablePost } from "@/lib/admin-store";
import { prepareAdminImage } from "@/lib/admin-image";

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
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EditablePost>(emptyPost);
  const [imageAlt, setImageAlt] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAdminPostsForAdmin()
      .then((items) => {
        if (items.length) {
          setPosts(items);
          adminStore.posts.set(items);
        }
      })
      .catch(() => null);
  }, []);

  function save(next: EditablePost[], text: string) {
    setPosts(next);
    adminStore.posts.set(next);
    setMessage(text);
  }

  function startNew() {
    setEditing(null);
    setFormOpen(true);
    setForm({ ...emptyPost, date: new Date().toISOString().slice(0, 10) });
    setImageAlt("");
    setMessage("");
  }

  function startEdit(post: EditablePost) {
    setEditing(post);
    setFormOpen(true);
    setForm(post);
    setImageAlt("");
    setMessage("");
  }

  function buildPost(status = form.status) {
    const slug = form.slug || slugify(form.title);
    if (!slug || !form.title || !form.body) {
      setMessage("Preencha titulo, slug e conteudo.");
      return null;
    }
    return { ...form, slug, status };
  }

  async function upsertPost(post: EditablePost, createdMessage: string, updatedMessage: string) {
    let savedPost = post;
    let remoteSaved = true;
    try {
      savedPost = await saveAdminPost(post);
    } catch {
      remoteSaved = false;
    }
    const exists = posts.some((item) => item.slug === post.slug);
    const next = exists ? posts.map((item) => item.slug === post.slug ? savedPost : item) : [savedPost, ...posts];
    save(next, remoteSaved ? (exists ? updatedMessage : createdMessage) : "Artigo guardado localmente. Confirme que o Supabase/RLS esta configurado.");
    setEditing(savedPost);
    setForm(savedPost);
    setFormOpen(false);
  }

  function savePost() {
    const post = buildPost();
    if (!post) return;
    upsertPost(post, "Artigo criado.", "Artigo actualizado.");
  }

  function savePostWithStatus(status: EditablePost["status"]) {
    const post = buildPost(status);
    if (!post) return;
    upsertPost(post, status === "Publicado" ? "Artigo publicado." : "Artigo guardado como rascunho.", status === "Publicado" ? "Artigo publicado." : "Artigo guardado como rascunho.");
  }

  async function updatePostStatus(post: EditablePost, status: EditablePost["status"]) {
    const nextPost = { ...post, status };
    let remoteSaved = true;
    try {
      await saveAdminPost(nextPost);
    } catch {
      remoteSaved = false;
    }
    save(posts.map((item) => item.slug === post.slug ? nextPost : item), remoteSaved ? (status === "Publicado" ? "Artigo publicado." : "Artigo passou a rascunho.") : "Estado guardado localmente. Confirme que o Supabase/RLS esta configurado.");
    if (editing?.slug === post.slug) {
      setEditing(nextPost);
      setForm(nextPost);
    }
  }

  function insertImage(src: string, alt = imageAlt) {
    const cleanSrc = src.trim();
    const cleanAlt = alt.trim() || "Imagem do artigo";
    if (!cleanSrc) {
      setMessage("Adicione o link ou escolha uma imagem primeiro.");
      return;
    }

    const imageLine = `![${cleanAlt}](${cleanSrc})`;
    setForm((current) => ({
      ...current,
      body: current.body.trim() ? `${current.body.trim()}\n\n${imageLine}\n\n` : `${imageLine}\n\n`
    }));
    setImageAlt("");
    setMessage("Imagem adicionada ao conteudo.");
  }

  async function handleImageFile(file: File | undefined) {
    if (!file) return;
    try {
      const result = await prepareAdminImage(file, { width: 1400, height: 900, fit: "max" });
      insertImage(result, imageAlt || file.name.replace(/\.[^.]+$/, ""));
      setMessage("Imagem ajustada e adicionada ao conteudo.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel preparar a imagem.");
    }
  }

  async function deletePost(slug: string) {
    let remoteDeleted = true;
    try {
      await deleteAdminPost(slug);
    } catch {
      remoteDeleted = false;
    }
    save(posts.filter((item) => item.slug !== slug), remoteDeleted ? "Artigo removido." : "Artigo removido localmente. Confirme que o Supabase/RLS esta configurado.");
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
      {formOpen ? <div className="card-body">
        <div className="row g-3">
          <div className="col-md-7"><label className="form-label fw-bold">Titulo</label><input className="admin-form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: editing ? form.slug : slugify(event.target.value) })} /></div>
          <div className="col-md-5"><label className="form-label fw-bold">Slug</label><input className="admin-form-control" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Autor</label><input className="admin-form-control" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Data</label><input className="admin-form-control" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Estado</label><select className="admin-form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EditablePost["status"] })}><option>Publicado</option><option>Rascunho</option></select></div>
          <div className="col-12"><label className="form-label fw-bold">Resumo</label><textarea className="admin-form-control" rows={2} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} /></div>
          <div className="col-12">
            <label className="form-label fw-bold">Imagens no conteudo</label>
            <div className="admin-inline-tools">
              <input className="admin-form-control" value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Descricao da imagem" />
            </div>
            <input className="admin-form-control mt-2" type="file" accept="image/*" onChange={(event) => handleImageFile(event.target.files?.[0])} />
            <div className="text-muted small mt-2">A imagem e ajustada automaticamente e inserida no conteudo.</div>
          </div>
          <div className="col-12"><label className="form-label fw-bold">Conteudo</label><textarea className="admin-form-control" rows={8} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></div>
          <div className="col-12 d-flex gap-2 flex-wrap">
            <button className="admin-action-btn" onClick={savePost}>{editing ? "Guardar artigo" : "Criar artigo"}</button>
            <button className="admin-action-btn admin-action-primary" onClick={() => savePostWithStatus("Publicado")}>Publicar</button>
            <button className="admin-action-btn" onClick={() => savePostWithStatus("Rascunho")}>Guardar como rascunho</button>
            <button className="admin-action-btn" onClick={() => { setFormOpen(false); setEditing(null); setForm(emptyPost); }}>Fechar</button>
          </div>
          <div className="col-12">
            <div className="admin-preview-box">
              <div className="text-muted small fw-bold mb-2">Pre-visualizacao</div>
              <BlogContent body={form.body} preview />
            </div>
          </div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div> : message ? <div className="card-body"><p className="text-muted mb-0">{message}</p></div> : null}
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>Titulo</th><th>Autor</th><th>Data</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug}>
                <td className="fw-bold">{post.title}<div className="text-muted small">/{post.slug}</div></td>
                <td>{post.author}</td>
                <td>{post.date}</td>
                <td><span className={`admin-pill ${post.status === "Publicado" ? "admin-pill-success" : "admin-pill-warning"}`}>{post.status}</span></td>
                <td className="d-flex justify-content-end gap-2 flex-wrap">
                  <button className="admin-action-btn" onClick={() => startEdit(post)}>Editar</button>
                  {post.status === "Publicado" ? (
                    <button className="admin-action-btn" onClick={() => updatePostStatus(post, "Rascunho")}>Retirar</button>
                  ) : (
                    <button className="admin-action-btn admin-action-primary" onClick={() => updatePostStatus(post, "Publicado")}>Publicar</button>
                  )}
                  <button className="admin-action-btn" onClick={() => deletePost(post.slug)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
