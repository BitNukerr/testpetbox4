"use client";

import { useState } from "react";
import BlogContent from "@/components/BlogContent";
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
  const [form, setForm] = useState<EditablePost>(emptyPost);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [message, setMessage] = useState("");

  function save(next: EditablePost[], text: string) {
    setPosts(next);
    adminStore.posts.set(next);
    setMessage(text);
  }

  function startNew() {
    setEditing(null);
    setForm({ ...emptyPost, date: new Date().toISOString().slice(0, 10) });
    setImageUrl("");
    setImageAlt("");
    setMessage("");
  }

  function startEdit(post: EditablePost) {
    setEditing(post);
    setForm(post);
    setImageUrl("");
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

  function upsertPost(post: EditablePost, createdMessage: string, updatedMessage: string) {
    const exists = posts.some((item) => item.slug === post.slug);
    const next = exists ? posts.map((item) => item.slug === post.slug ? post : item) : [post, ...posts];
    save(next, exists ? updatedMessage : createdMessage);
    setEditing(post);
    setForm(post);
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

  function updatePostStatus(post: EditablePost, status: EditablePost["status"]) {
    const nextPost = { ...post, status };
    save(posts.map((item) => item.slug === post.slug ? nextPost : item), status === "Publicado" ? "Artigo publicado." : "Artigo passou a rascunho.");
    if (editing?.slug === post.slug) {
      setEditing(nextPost);
      setForm(nextPost);
    }
  }

  function insertImage(src = imageUrl, alt = imageAlt) {
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
    setImageUrl("");
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
          <div className="col-md-7"><label className="form-label fw-bold">Titulo</label><input className="admin-form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: editing ? form.slug : slugify(event.target.value) })} /></div>
          <div className="col-md-5"><label className="form-label fw-bold">Slug</label><input className="admin-form-control" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Autor</label><input className="admin-form-control" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Data</label><input className="admin-form-control" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div>
          <div className="col-md-4"><label className="form-label fw-bold">Estado</label><select className="admin-form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EditablePost["status"] })}><option>Publicado</option><option>Rascunho</option></select></div>
          <div className="col-12"><label className="form-label fw-bold">Resumo</label><textarea className="admin-form-control" rows={2} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} /></div>
          <div className="col-12">
            <label className="form-label fw-bold">Imagens no conteudo</label>
            <div className="admin-inline-tools">
              <input className="admin-form-control" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="/images/foto.jpg ou https://..." />
              <input className="admin-form-control" value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Descricao da imagem" />
              <button className="admin-action-btn" onClick={() => insertImage()}>Inserir imagem</button>
            </div>
            <input className="admin-form-control mt-2" type="file" accept="image/*" onChange={(event) => handleImageFile(event.target.files?.[0])} />
            <div className="text-muted small mt-2">Tambem pode escrever no texto: ![Descricao](/images/foto.jpg)</div>
          </div>
          <div className="col-12"><label className="form-label fw-bold">Conteudo</label><textarea className="admin-form-control" rows={8} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></div>
          <div className="col-12 d-flex gap-2 flex-wrap">
            <button className="admin-action-btn" onClick={savePost}>{editing ? "Guardar artigo" : "Criar artigo"}</button>
            <button className="admin-action-btn admin-action-primary" onClick={() => savePostWithStatus("Publicado")}>Publicar</button>
            <button className="admin-action-btn" onClick={() => savePostWithStatus("Rascunho")}>Guardar como rascunho</button>
            <button className="admin-action-btn" onClick={startNew}>Limpar</button>
          </div>
          <div className="col-12">
            <div className="admin-preview-box">
              <div className="text-muted small fw-bold mb-2">Pre-visualizacao</div>
              <BlogContent body={form.body} preview />
            </div>
          </div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>
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
