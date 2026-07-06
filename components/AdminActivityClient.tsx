"use client";

import { useEffect, useMemo, useState } from "react";
import { clearLocalAdminActivity, getLocalAdminActivity, loadRemoteAdminActivity, type AdminActivity } from "@/lib/admin-activity";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminActivityClient() {
  const [localItems, setLocalItems] = useState<AdminActivity[]>([]);
  const [remoteItems, setRemoteItems] = useState<AdminActivity[]>([]);
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshLocal = () => setLocalItems(getLocalAdminActivity());
    refreshLocal();
    window.addEventListener("petbox-admin-activity-changed", refreshLocal);

    loadRemoteAdminActivity()
      .then((result) => {
        setRemoteItems(result.data);
        setSetupRequired(result.setupRequired);
      })
      .catch(() => setSetupRequired(true))
      .finally(() => setLoading(false));

    return () => window.removeEventListener("petbox-admin-activity-changed", refreshLocal);
  }, []);

  const items = useMemo(() => {
    const seen = new Set<string>();
    return [...remoteItems, ...localItems]
      .filter((item) => {
        const key = `${item.createdAt}-${item.action}-${item.target}-${item.detail}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100);
  }, [localItems, remoteItems]);

  function clearLocal() {
    clearLocalAdminActivity();
    setLocalItems([]);
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Atividade</h2>
          <div className="text-muted">Historico das alteracoes feitas no painel.</div>
        </div>
        <button className="admin-action-btn" onClick={clearLocal}>Limpar atividade local</button>
      </div>

      <div className="card-body">
        {loading ? <div className="admin-setup-note mb-3">A carregar atividade...</div> : null}
        {setupRequired ? (
          <div className="admin-setup-note warning mb-3">
            A tabela persistente de atividade ainda nao existe no Supabase. A atividade local aparece neste browser; para guardar no servidor, execute o SQL actualizado.
          </div>
        ) : null}

        <div className="admin-activity-list">
          {items.length === 0 && !loading ? <p className="text-muted mb-0">Ainda nao ha atividade registada.</p> : null}
          {items.map((item) => (
            <article className="admin-activity-item" key={item.id}>
              <div>
                <strong>{item.action} - {item.target}</strong>
                <p>{item.detail || "Sem detalhe"}</p>
              </div>
              <div className="admin-activity-meta">
                <span>{formatDate(item.createdAt)}</span>
                <small>{item.source === "supabase" ? "Supabase" : "Local"}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
