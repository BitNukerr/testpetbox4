"use client";

export default function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    window.location.href = "/admin";
  }

  return <button className="admin-action-btn admin-logout-btn" onClick={logout}>Sair</button>;
}
