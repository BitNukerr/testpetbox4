import { adminJournalPosts } from "@/data/admin";

export default function AdminJournalPage() {
  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Blog</h2>
          <div className="text-muted">Gestão dos artigos usados na estratégia SEO.</div>
        </div>
        <button className="admin-action-btn">Novo artigo</button>
      </div>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>Título</th><th>Autor</th><th>Data</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {adminJournalPosts.map((post) => (
              <tr key={post.slug}>
                <td className="fw-bold">{post.title}<div className="text-muted small">/{post.slug}</div></td>
                <td>{post.author}</td>
                <td>{post.date}</td>
                <td><span className={`admin-pill ${post.status === "Publicado" ? "admin-pill-success" : "admin-pill-warning"}`}>{post.status}</span></td>
                <td><button className="admin-action-btn">Editar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
