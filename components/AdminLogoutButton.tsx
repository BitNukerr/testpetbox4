"use client";

const STORAGE_KEY = "petbox-admin-unlocked";

export default function AdminLogoutButton() {
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/admin";
  }

  return <button className="admin-action-btn admin-logout-btn" onClick={logout}>Sair</button>;
}
