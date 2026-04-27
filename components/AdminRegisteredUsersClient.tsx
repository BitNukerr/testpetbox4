"use client";

import { useEffect, useMemo, useState } from "react";

type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  lastSignInAt?: string | null;
  emailConfirmedAt?: string | null;
  metadata: Record<string, unknown>;
};

type UsersResponse = {
  configured: boolean;
  users: RegisteredUser[];
  error?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function metadataSummary(metadata: Record<string, unknown>) {
  const ignored = new Set(["full_name", "name", "first_name", "last_name"]);
  const entries = Object.entries(metadata).filter(([key, value]) => !ignored.has(key) && value !== null && value !== "");
  if (!entries.length) return "Sem dados extra";
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(" | ");
}

export default function AdminRegisteredUsersClient() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/registered-users");
      const data: UsersResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel carregar os utilizadores.");
      }

      setConfigured(data.configured);
      setUsers(data.users);
      if (data.error) setError(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar os utilizadores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return users;
    return users.filter((user) => `${user.name} ${user.email} ${user.phone} ${user.id}`.toLowerCase().includes(cleanQuery));
  }, [query, users]);

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-lg-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Utilizadores registados</h2>
          <div className="text-muted">Contas criadas no login/registo Supabase.</div>
        </div>
        <div className="admin-users-actions">
          <input className="admin-form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar nome, email ou telefone" />
          <button className="admin-action-btn admin-action-primary" onClick={loadUsers} disabled={loading}>{loading ? "A carregar" : "Actualizar"}</button>
        </div>
      </div>

      <div className="card-body">
        <div className="row g-3 mb-3">
          <div className="col-sm-6 col-xl-3"><div className="admin-mini-stat"><span>Total</span><strong>{users.length}</strong></div></div>
          <div className="col-sm-6 col-xl-3"><div className="admin-mini-stat"><span>Email confirmado</span><strong>{users.filter((user) => user.emailConfirmedAt).length}</strong></div></div>
          <div className="col-sm-6 col-xl-3"><div className="admin-mini-stat"><span>Com telefone</span><strong>{users.filter((user) => user.phone).length}</strong></div></div>
          <div className="col-sm-6 col-xl-3"><div className="admin-mini-stat"><span>Resultado</span><strong>{filteredUsers.length}</strong></div></div>
        </div>

        {!configured ? <div className="admin-setup-note mb-3">{error}</div> : null}
        {configured && error ? <div className="admin-setup-note warning mb-3">{error}</div> : null}

        <div className="table-responsive">
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Criado em</th>
                <th>Ultima entrada</th>
                <th>Dados extra</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong><div className="text-muted small">{user.id}</div></td>
                  <td>{user.email}<div>{user.emailConfirmedAt ? <span className="admin-pill admin-pill-success mt-1">Confirmado</span> : <span className="admin-pill admin-pill-warning mt-1">Por confirmar</span>}</div></td>
                  <td>{user.phone || "Sem telefone"}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.lastSignInAt)}</td>
                  <td className="text-muted small">{metadataSummary(user.metadata)}</td>
                </tr>
              ))}
              {!loading && !filteredUsers.length ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Nenhum utilizador encontrado.</td></tr>
              ) : null}
              {loading ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">A carregar utilizadores...</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
