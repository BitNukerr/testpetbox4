"use client";

import { useEffect, useMemo, useState } from "react";
import { adminStore } from "@/lib/admin-store";
import type { AdminSubscription } from "@/data/admin";

type SubscriptionUser = {
  id: string;
  name: string;
  email: string;
};

type SubscriptionPet = {
  id: string;
  userId: string;
  name: string;
  species: "dog" | "cat";
  size: "small" | "medium" | "large";
};

type SubscriptionPlan = {
  id: string;
  name: string;
  cadence: "monthly" | "quarterly";
  price: number;
};

type SubscriptionResponse = {
  data: AdminSubscription[];
  users?: SubscriptionUser[];
  pets?: SubscriptionPet[];
  plans?: SubscriptionPlan[];
  error?: string;
};

const emptySub: AdminSubscription = {
  id: "",
  userId: "",
  userEmail: "",
  petId: "",
  planId: "",
  cadence: "monthly",
  customer: "",
  plan: "Mensal",
  pet: "Cão",
  nextBoxDate: "",
  renewal: "",
  status: "Ativa",
  value: 0,
  extras: ""
};

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function todayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function planDisplay(plan?: SubscriptionPlan) {
  return plan?.cadence === "quarterly" ? "Trimestral" : "Mensal";
}

function petDisplay(pet?: SubscriptionPet) {
  return pet?.species === "cat" ? "Gato" : "Cão";
}

function statusPill(status: AdminSubscription["status"]) {
  if (status === "Ativa") return "admin-pill-success";
  if (status === "Pausada") return "admin-pill-warning";
  return "admin-pill-danger";
}

function userLabel(user: SubscriptionUser) {
  return `${user.name}${user.email ? ` (${user.email})` : ""}`;
}

export default function AdminSubscriptionsClient() {
  const [subs, setSubs] = useState<AdminSubscription[]>(() => adminStore.subscriptions.get());
  const [users, setUsers] = useState<SubscriptionUser[]>([]);
  const [pets, setPets] = useState<SubscriptionPet[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editing, setEditing] = useState<AdminSubscription | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AdminSubscription>(emptySub);
  const [loading, setLoading] = useState(true);
  const [remoteReady, setRemoteReady] = useState(false);
  const [message, setMessage] = useState("");

  const petsForSelectedUser = useMemo(
    () => pets.filter((pet) => pet.userId === form.userId),
    [form.userId, pets]
  );

  async function loadSubscriptions() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/store?resource=subscriptions");
      const data: SubscriptionResponse = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar subscrições.");

      setSubs(data.data || []);
      setUsers(data.users || []);
      setPets(data.pets || []);
      setPlans(data.plans || []);
      setRemoteReady(true);
      adminStore.subscriptions.set(data.data || []);
    } catch (error) {
      setRemoteReady(false);
      setSubs(adminStore.subscriptions.get());
      setMessage(error instanceof Error ? `${error.message} A mostrar dados locais.` : "A mostrar dados locais.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  function buildDefaultForm(userId = users[0]?.id || "") {
    const user = users.find((item) => item.id === userId) || users[0];
    const userPets = user ? pets.filter((pet) => pet.userId === user.id) : [];
    const plan = plans[0];
    const pet = userPets[0];

    return {
      ...emptySub,
      id: "",
      userId: user?.id || "",
      userEmail: user?.email || "",
      customer: user?.name || "",
      petId: pet?.id || "",
      pet: petDisplay(pet),
      planId: plan?.id || "",
      cadence: plan?.cadence || "monthly",
      plan: planDisplay(plan),
      nextBoxDate: todayPlus(14),
      renewal: todayPlus(plan?.cadence === "quarterly" ? 90 : 30),
      value: plan?.price || 0
    } satisfies AdminSubscription;
  }

  function startNew() {
    setEditing(null);
    setFormOpen(true);
    setForm(remoteReady ? buildDefaultForm() : { ...emptySub, id: `SUB-${Date.now().toString().slice(-4)}` });
    setMessage("");
  }

  function startEdit(sub: AdminSubscription) {
    setEditing(sub);
    setFormOpen(true);
    setForm({
      ...emptySub,
      ...sub,
      nextBoxDate: sub.nextBoxDate || todayPlus(14),
      extras: sub.extras || ""
    });
    setMessage("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(emptySub);
  }

  function updateUser(userId: string) {
    const next = buildDefaultForm(userId);
    setForm((current) => ({
      ...current,
      userId: next.userId,
      userEmail: next.userEmail,
      customer: next.customer,
      petId: next.petId,
      pet: next.pet
    }));
  }

  function updatePlan(planId: string) {
    const plan = plans.find((item) => item.id === planId);
    setForm((current) => ({
      ...current,
      planId,
      cadence: plan?.cadence || current.cadence,
      plan: planDisplay(plan),
      renewal: current.renewal || todayPlus(plan?.cadence === "quarterly" ? 90 : 30),
      value: plan?.price || current.value
    }));
  }

  function updatePet(petId: string) {
    const pet = pets.find((item) => item.id === petId);
    setForm((current) => ({ ...current, petId, pet: petDisplay(pet) }));
  }

  function saveLocalSub(next: AdminSubscription, text: string) {
    const exists = subs.some((item) => item.id === next.id);
    const nextSubs = exists ? subs.map((item) => item.id === next.id ? next : item) : [next, ...subs];
    setSubs(nextSubs);
    adminStore.subscriptions.set(nextSubs);
    setMessage(text);
    setFormOpen(false);
  }

  async function saveSub() {
    if (!remoteReady) {
      if (!form.id || !form.customer) {
        setMessage("Preencha ID e cliente.");
        return;
      }
      saveLocalSub({ ...form, value: Number(form.value) }, editing ? "Subscrição local actualizada." : "Subscrição local criada.");
      return;
    }

    if (!form.userId || !form.planId) {
      setMessage("Escolha cliente e plano.");
      return;
    }

    try {
      const response = await fetch("/api/admin/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource: "subscriptions", item: form })
      });
      const data: { data?: AdminSubscription; error?: string } = await response.json();
      if (!response.ok || !data.data) throw new Error(data.error || "Não foi possível guardar a subscrição.");

      const exists = subs.some((item) => item.id === data.data!.id);
      const nextSubs = exists ? subs.map((item) => item.id === data.data!.id ? data.data! : item) : [data.data, ...subs];
      setSubs(nextSubs);
      adminStore.subscriptions.set(nextSubs);
      setEditing(data.data);
      setFormOpen(false);
      setMessage(exists ? "Subscrição actualizada no Supabase." : "Subscrição criada no Supabase.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível guardar a subscrição.");
    }
  }

  async function deleteSub(id: string) {
    if (!remoteReady) {
      const next = subs.filter((item) => item.id !== id);
      setSubs(next);
      adminStore.subscriptions.set(next);
      closeForm();
      setMessage("Subscrição local removida.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/store?resource=subscriptions&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível remover a subscrição.");
      const next = subs.filter((item) => item.id !== id);
      setSubs(next);
      adminStore.subscriptions.set(next);
      closeForm();
      setMessage("Subscrição removida do Supabase.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível remover a subscrição.");
    }
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Subscrições</h2>
          <div className="text-muted">Gerir planos activos, pausas, renovações e próximas caixas de clientes registados.</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="admin-action-btn admin-action-primary" onClick={startNew} disabled={remoteReady && (!users.length || !plans.length)}>Nova subscrição</button>
          <button className="admin-action-btn" onClick={loadSubscriptions} disabled={loading}>{loading ? "A carregar" : "Actualizar"}</button>
        </div>
      </div>

      <div className="card-body">
        <div className="row g-3 mb-3">
          <div className="col-sm-6 col-xl-3"><div className="admin-mini-stat"><span>Total</span><strong>{subs.length}</strong></div></div>
          <div className="col-sm-6 col-xl-3"><div className="admin-mini-stat"><span>Activas</span><strong>{subs.filter((sub) => sub.status === "Ativa").length}</strong></div></div>
          <div className="col-sm-6 col-xl-3"><div className="admin-mini-stat"><span>Pausadas</span><strong>{subs.filter((sub) => sub.status === "Pausada").length}</strong></div></div>
          <div className="col-sm-6 col-xl-3"><div className="admin-mini-stat"><span>Valor activo</span><strong>{money(subs.filter((sub) => sub.status === "Ativa").reduce((sum, sub) => sum + Number(sub.value || 0), 0))}</strong></div></div>
        </div>

        {!remoteReady ? <div className="admin-setup-note warning mb-3">Subscrições em modo local. Quando o Supabase estiver configurado, esta página grava na tabela customer_subscriptions.</div> : null}
        {remoteReady && !users.length ? <div className="admin-setup-note mb-3">Ainda não existem perfis registados. Depois de um cliente iniciar sessão, poderá criar uma subscrição aqui.</div> : null}
        {message ? <div className="admin-setup-note mb-3">{message}</div> : null}

        {formOpen ? (
          <div className="admin-config-editor mb-4">
            <div className="admin-config-group-head">
              <div>
                <h3>{editing ? "Editar subscrição" : "Nova subscrição"}</h3>
                <p>{remoteReady ? "Escolha um cliente registado, plano e estado da próxima caixa." : "Modo local para desenvolvimento."}</p>
              </div>
            </div>
            <div className="row g-3">
              {!remoteReady ? (
                <>
                  <div className="col-md-2"><label className="form-label fw-bold">ID</label><input className="admin-form-control" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} /></div>
                  <div className="col-md-4"><label className="form-label fw-bold">Cliente</label><input className="admin-form-control" value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></div>
                </>
              ) : (
                <div className="col-md-6">
                  <label className="form-label fw-bold">Cliente</label>
                  <select className="admin-form-control" value={form.userId || ""} onChange={(event) => updateUser(event.target.value)}>
                    {users.map((user) => <option key={user.id} value={user.id}>{userLabel(user)}</option>)}
                  </select>
                </div>
              )}
              <div className="col-md-3">
                <label className="form-label fw-bold">Plano</label>
                {remoteReady ? (
                  <select className="admin-form-control" value={form.planId || ""} onChange={(event) => updatePlan(event.target.value)}>
                    {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} - {money(plan.price)}</option>)}
                  </select>
                ) : (
                  <select className="admin-form-control" value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value as AdminSubscription["plan"] })}><option>Mensal</option><option>Trimestral</option></select>
                )}
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Animal</label>
                {remoteReady ? (
                  <select className="admin-form-control" value={form.petId || ""} onChange={(event) => updatePet(event.target.value)}>
                    <option value="">Sem animal ligado</option>
                    {petsForSelectedUser.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} - {petDisplay(pet)}</option>)}
                  </select>
                ) : (
                  <select className="admin-form-control" value={form.pet} onChange={(event) => setForm({ ...form, pet: event.target.value as AdminSubscription["pet"] })}><option>Cão</option><option>Gato</option></select>
                )}
              </div>
              <div className="col-md-3"><label className="form-label fw-bold">Valor</label><input className="admin-form-control" type="number" min="0" step="0.01" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label fw-bold">Próxima caixa</label><input className="admin-form-control" type="date" value={form.nextBoxDate || ""} onChange={(event) => setForm({ ...form, nextBoxDate: event.target.value })} /></div>
              <div className="col-md-3"><label className="form-label fw-bold">Renovação</label><input className="admin-form-control" type="date" value={form.renewal || ""} onChange={(event) => setForm({ ...form, renewal: event.target.value })} /></div>
              <div className="col-md-3"><label className="form-label fw-bold">Estado</label><select className="admin-form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminSubscription["status"] })}><option>Ativa</option><option>Pausada</option><option>Cancelamento agendado</option></select></div>
              <div className="col-12"><label className="form-label fw-bold">Notas ou extras da subscrição</label><textarea className="admin-form-control" rows={3} value={form.extras || ""} onChange={(event) => setForm({ ...form, extras: event.target.value })} /></div>
              <div className="col-12 d-flex gap-2 flex-wrap">
                <button className="admin-action-btn admin-action-primary" onClick={saveSub}>{editing ? "Guardar subscrição" : "Criar subscrição"}</button>
                <button className="admin-action-btn" onClick={closeForm}>Fechar</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>Cliente</th><th>Animal</th><th>Plano</th><th>Próxima caixa</th><th>Renovação</th><th>Estado</th><th>Valor</th><th /></tr></thead>
          <tbody>
            {subs.map((sub) => (
              <tr key={sub.id}>
                <td><strong>{sub.customer}</strong><div className="text-muted small">{sub.userEmail || sub.id}</div></td>
                <td>{sub.pet}</td>
                <td>{sub.plan}</td>
                <td>{sub.nextBoxDate || "Por definir"}</td>
                <td>{sub.renewal || "Por definir"}</td>
                <td><span className={`admin-pill ${statusPill(sub.status)}`}>{sub.status}</span></td>
                <td className="fw-bold">{money(sub.value)}</td>
                <td className="d-flex justify-content-end gap-2"><button className="admin-action-btn" onClick={() => startEdit(sub)}>Editar</button><button className="admin-action-btn" onClick={() => deleteSub(sub.id)}>Remover</button></td>
              </tr>
            ))}
            {!loading && !subs.length ? <tr><td colSpan={8} className="text-center text-muted py-4">Ainda não existem subscrições.</td></tr> : null}
            {loading ? <tr><td colSpan={8} className="text-center text-muted py-4">A carregar subscrições...</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
