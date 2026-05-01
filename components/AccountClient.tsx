"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthClient from "@/components/AuthClient";
import type { Plan } from "@/data/products";
import { deleteRemotePet, loadRemoteAccount, saveRemoteAddress, saveRemotePet, saveRemoteProfile, saveRemoteSubscription } from "@/lib/account-db";
import { adminStore } from "@/lib/admin-store";
import {
  type AccountAddress,
  type AccountPet,
  type AccountSubscription,
  getAddress,
  getOrders,
  getPets,
  getSubscription,
  setAddress,
  setPets,
  setSubscription
} from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

type UserState = { id: string; email?: string; name?: string; createdAt?: string } | null;

const emptyPet: AccountPet = {
  id: "",
  name: "",
  species: "dog",
  size: "medium",
  birthday: "",
  allergies: "",
  preferences: ""
};

const emptyAddress: AccountAddress = {
  name: "",
  phone: "",
  mbwayPhone: "",
  address: "",
  city: "",
  zip: "",
  nif: ""
};

function todayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function petSpeciesLabel(value: AccountPet["species"]) {
  return value === "dog" ? "Cao" : "Gato";
}

function petSizeLabel(value: AccountPet["size"]) {
  if (value === "small") return "Pequeno";
  if (value === "large") return "Grande";
  return "Medio";
}

function subscriptionStatusLabel(value: AccountSubscription["status"]) {
  if (value === "active") return "Activa";
  if (value === "paused") return "Pausada";
  return "Cancelada";
}

function subscriptionPill(value?: AccountSubscription["status"]) {
  if (value === "active") return "admin-pill-success";
  if (value === "paused") return "admin-pill-warning";
  return "admin-pill-danger";
}

export default function AccountClient() {
  const [orders, setOrders] = useState<ReturnType<typeof getOrders>>([]);
  const [pets, setPetsState] = useState<AccountPet[]>([]);
  const [petForm, setPetForm] = useState<AccountPet>(emptyPet);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [address, setAddressState] = useState<AccountAddress>(emptyAddress);
  const [subscription, setSubscriptionState] = useState<AccountSubscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>(() => adminStore.plans.get());
  const [user, setUser] = useState<UserState>(null);
  const [profileName, setProfileName] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [message, setMessage] = useState("");

  const accountScope = user?.id || user?.email || "";
  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === subscription?.plan) || plans[0], [plans, subscription?.plan]);
  const selectedPet = useMemo(() => pets.find((pet) => pet.id === subscription?.petId), [pets, subscription?.petId]);
  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(profileName.trim()),
      Boolean(address.name.trim()),
      Boolean(address.phone.trim()),
      Boolean(address.address.trim() && address.city.trim() && address.zip.trim()),
      pets.length > 0,
      Boolean(subscription)
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [address, pets.length, profileName, subscription]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuthChecked(true);
      return;
    }

    let mounted = true;
    let initialSessionLoaded = false;

    const applySession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (!mounted) return;
      const metadata = session?.user.user_metadata || {};
      const name = typeof metadata.full_name === "string" ? metadata.full_name : typeof metadata.name === "string" ? metadata.name : "";
      setUser(session?.user ? { id: session.user.id, email: session.user.email || "", name, createdAt: session.user.created_at } : null);
      setProfileName(name);
      setAuthChecked(true);
    };

    supabase.auth.getSession().then(({ data }) => {
      initialSessionLoaded = true;
      applySession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!initialSessionLoaded && event !== "SIGNED_IN") return;
      applySession(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const refreshOrders = () => setOrders(getOrders(accountScope));
    const refreshAccount = () => {
      setPetsState(getPets(accountScope));
      setAddressState(getAddress(accountScope));
      setSubscriptionState(getSubscription(accountScope));
    };
    const refreshAdmin = () => setPlans(adminStore.plans.get());

    refreshOrders();
    refreshAccount();
    refreshAdmin();
    window.addEventListener("petbox-orders-changed", refreshOrders);
    window.addEventListener("petbox-account-changed", refreshAccount);
    window.addEventListener("petbox-admin-changed", refreshAdmin);
    return () => {
      window.removeEventListener("petbox-orders-changed", refreshOrders);
      window.removeEventListener("petbox-account-changed", refreshAccount);
      window.removeEventListener("petbox-admin-changed", refreshAdmin);
    };
  }, [accountScope]);

  useEffect(() => {
    if (!user?.id || !supabase) {
      setRemoteReady(false);
      return;
    }

    let mounted = true;
    loadRemoteAccount(user.id)
      .then((data) => {
        if (!mounted) return;
        if (data.profile?.full_name) setProfileName(data.profile.full_name);
        setPetsState(data.pets);
        setAddressState(data.address || emptyAddress);
        setSubscriptionState(data.subscription);
        setOrders(data.orders);
        setRemoteReady(true);
      })
      .catch(() => setRemoteReady(false));

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  async function savePet() {
    if (!petForm.name.trim()) {
      setMessage("Adicione o nome do animal.");
      return;
    }

    const pet = { ...petForm, id: petForm.id || `pet-${Date.now()}` };
    let savedPet = pet;
    if (user?.id && supabase) {
      try {
        savedPet = await saveRemotePet(user.id, pet);
      } catch {
        setMessage("Nao foi possivel guardar no Supabase. Guardei neste browser.");
      }
    }

    const nextPets = editingPetId
      ? pets.map((item) => item.id === editingPetId ? savedPet : item)
      : [...pets, savedPet];

    setPets(nextPets, accountScope);
    setPetsState(nextPets);
    setPetForm(emptyPet);
    setEditingPetId(null);
    setMessage(remoteReady ? "Perfil do animal guardado no Supabase." : "Perfil do animal guardado.");
  }

  function editPet(pet: AccountPet) {
    setPetForm(pet);
    setEditingPetId(pet.id);
    setMessage("");
  }

  async function deletePet(id: string) {
    if (user?.id && supabase && !id.startsWith("pet-")) {
      try {
        await deleteRemotePet(id);
      } catch {
        setMessage("Nao foi possivel remover no Supabase.");
        return;
      }
    }
    const nextPets = pets.filter((pet) => pet.id !== id);
    setPets(nextPets, accountScope);
    setPetsState(nextPets);
    if (subscription?.petId === id) {
      setSubscription(null, accountScope);
      setSubscriptionState(null);
    }
    setPetForm(emptyPet);
    setEditingPetId(null);
    setMessage("Perfil removido.");
  }

  async function saveAddress() {
    if (user?.id && supabase) {
      try {
        await saveRemoteAddress(user.id, address);
      } catch {
        setMessage("Nao foi possivel guardar no Supabase. Guardei neste browser.");
      }
    }
    setAddress(address, accountScope);
    setMessage("Dados de entrega guardados.");
  }

  async function saveProfile() {
    if (!profileName.trim()) {
      setMessage("Adicione o nome do perfil.");
      return;
    }
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ data: { full_name: profileName.trim() } });
      if (error) {
        setMessage("Nao foi possivel actualizar o perfil.");
        return;
      }
      if (user?.id) {
        await saveRemoteProfile(user.id, user.email || "", profileName.trim()).catch(() => null);
      }
    }
    setUser((current) => current ? { ...current, name: profileName.trim() } : current);
    setMessage("Perfil actualizado.");
  }

  async function createOrUpdateSubscription() {
    const plan = selectedPlan || plans[0];
    const pet = selectedPet || pets[0];
    if (!plan || !pet) {
      setMessage("Adicione pelo menos um animal e um plano.");
      return;
    }

    const nextSubscription: AccountSubscription = {
      id: subscription?.id || `sub-${Date.now()}`,
      status: subscription?.status || "active",
      plan: plan.id,
      cadence: plan.cadence,
      petId: pet.id,
      nextBoxDate: subscription?.nextBoxDate || todayPlus(14),
      renewalDate: subscription?.renewalDate || todayPlus(plan.cadence === "monthly" ? 30 : 90),
      price: plan.price,
      extras: subscription?.extras || ""
    };
    let savedSubscription = nextSubscription;
    if (user?.id && supabase) {
      try {
        savedSubscription = await saveRemoteSubscription(user.id, nextSubscription);
      } catch {
        setMessage("Nao foi possivel guardar a subscricao no Supabase. Guardei neste browser.");
      }
    }
    setSubscription(savedSubscription, accountScope);
    setSubscriptionState(savedSubscription);
    setMessage("Subscricao guardada.");
  }

  async function updateSubscription(patch: Partial<AccountSubscription>) {
    if (!subscription) return;
    const next = { ...subscription, ...patch };
    let savedSubscription = next;
    if (user?.id && supabase) {
      try {
        savedSubscription = await saveRemoteSubscription(user.id, next);
      } catch {
        setMessage("Nao foi possivel actualizar no Supabase. Guardei neste browser.");
      }
    }
    setSubscription(savedSubscription, accountScope);
    setSubscriptionState(savedSubscription);
    setMessage("Subscricao actualizada.");
  }

  function skipNextBox() {
    if (!subscription) return;
    updateSubscription({
      nextBoxDate: todayPlus(subscription.cadence === "monthly" ? 30 : 90),
      renewalDate: todayPlus(subscription.cadence === "monthly" ? 30 : 90)
    });
  }

  function updateSubscriptionPlan(planId: string) {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    if (!subscription) {
      setSubscriptionState({
        id: "",
        status: "active",
        plan: plan.id,
        cadence: plan.cadence,
        petId: pets[0]?.id || "",
        nextBoxDate: todayPlus(14),
        renewalDate: todayPlus(plan.cadence === "monthly" ? 30 : 90),
        price: plan.price,
        extras: ""
      });
      return;
    }
    updateSubscription({ plan: plan.id, cadence: plan.cadence, price: plan.price });
  }

  if (!authChecked) {
    return (
      <div className="container narrow">
        <div className="card"><div className="card-body">
          <h2>{pt.common.loading}</h2>
          <p className="muted">{pt.account.checkingSession}</p>
        </div></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container narrow">
        <div className="section-heading">
          <div><span className="eyebrow">{pt.nav.login}</span><h1>Entrar na PetBox</h1></div>
        </div>
        <div className="auth-page-grid">
          <AuthClient />
          <div className="card auth-benefits"><div className="card-body">
            <span className="tag">Conta PetBox</span>
            <h2>Mais simples para voltar a comprar</h2>
            <ul className="perks">
              <li>Consultar encomendas recentes</li>
              <li>Acompanhar subscricoes activas</li>
              <li>Guardar o acesso a area de cliente</li>
            </ul>
          </div></div>
        </div>
        <p className="muted account-note">{pt.account.loginRequired}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container section-heading">
        <div><span className="eyebrow">{pt.nav.account}</span><h1>A sua conta PetBox</h1></div>
        <Link href="/criar-caixa" className="btn btn-secondary">Criar nova caixa</Link>
      </div>

      <div className="container account-overview">
        <div className="account-stat"><span>Animais</span><strong>{pets.length}</strong></div>
        <div className="account-stat"><span>Subscricao</span><strong>{subscription ? subscriptionStatusLabel(subscription.status) : "Sem plano"}</strong></div>
        <div className="account-stat"><span>Encomendas</span><strong>{orders.length}</strong></div>
      </div>

      <div className="container">
        <section className="card account-profile-card"><div className="card-body">
          <div className="account-card-heading">
            <div>
              <span className="tag">Perfil</span>
              <h2>{profileName || user.email}</h2>
              <p className="muted mb-0">{user.email}{user.createdAt ? ` | Cliente desde ${new Date(user.createdAt).toLocaleDateString("pt-PT")}` : ""}</p>
            </div>
            <div className="profile-progress" aria-label={`Perfil ${profileCompletion}% completo`}>
              <span>{profileCompletion}%</span>
              <div><i style={{ width: `${profileCompletion}%` }} /></div>
            </div>
          </div>
          <div className="form-grid account-form">
            <input placeholder="Nome para a conta" value={profileName} onChange={(event) => setProfileName(event.target.value)} />
            <button className="btn btn-secondary" onClick={saveProfile}>Guardar perfil</button>
          </div>
        </div></section>
      </div>

      <div className="container account-layout">
        <div className="account-main">
          <section className="card"><div className="card-body">
            <div className="account-card-heading">
              <div><span className="tag">Perfis</span><h2>Animais</h2></div>
              <button className="btn btn-secondary small" onClick={() => { setPetForm(emptyPet); setEditingPetId(null); }}>Novo animal</button>
            </div>
            <div className="pet-grid">
              {pets.length === 0 ? <p className="muted">Adicione o primeiro animal para personalizar as caixas.</p> : pets.map((pet) => (
                <article className="pet-profile" key={pet.id}>
                  <div>
                    <strong>{pet.name}</strong>
                    <span>{petSpeciesLabel(pet.species)} | {petSizeLabel(pet.size)}</span>
                    {pet.allergies ? <small>Alergias: {pet.allergies}</small> : null}
                    {pet.preferences ? <small>Preferencias: {pet.preferences}</small> : null}
                  </div>
                  <div className="action-row wrap">
                    <button className="link-btn" onClick={() => editPet(pet)}>Editar</button>
                    <button className="link-btn remove-btn" onClick={() => deletePet(pet.id)}>Remover</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="form-grid account-form">
              <input placeholder="Nome do animal" value={petForm.name} onChange={(event) => setPetForm({ ...petForm, name: event.target.value })} />
              <input type="date" value={petForm.birthday} onChange={(event) => setPetForm({ ...petForm, birthday: event.target.value })} />
              <select value={petForm.species} onChange={(event) => setPetForm({ ...petForm, species: event.target.value as AccountPet["species"] })}>
                <option value="dog">Cao</option>
                <option value="cat">Gato</option>
              </select>
              <select value={petForm.size} onChange={(event) => setPetForm({ ...petForm, size: event.target.value as AccountPet["size"] })}>
                <option value="small">Pequeno</option>
                <option value="medium">Medio</option>
                <option value="large">Grande</option>
              </select>
              <input className="span-2" placeholder="Alergias ou ingredientes a evitar" value={petForm.allergies} onChange={(event) => setPetForm({ ...petForm, allergies: event.target.value })} />
              <input className="span-2" placeholder="Preferencias de brinquedos, snacks ou estilo" value={petForm.preferences} onChange={(event) => setPetForm({ ...petForm, preferences: event.target.value })} />
            </div>
            <button className="btn top-gap" onClick={savePet}>{editingPetId ? "Guardar animal" : "Adicionar animal"}</button>
          </div></section>

          <section className="card"><div className="card-body">
            <div className="account-card-heading">
              <div><span className="tag">Entrega</span><h2>Dados de contacto e morada</h2></div>
              <button className="btn btn-secondary small" onClick={saveAddress}>Guardar</button>
            </div>
            <div className="form-grid account-form">
              <input placeholder="Nome completo" value={address.name} onChange={(event) => setAddressState({ ...address, name: event.target.value })} />
              <input placeholder="Telemovel" value={address.phone} onChange={(event) => setAddressState({ ...address, phone: event.target.value })} />
              <input placeholder="Telemovel MB WAY" value={address.mbwayPhone} onChange={(event) => setAddressState({ ...address, mbwayPhone: event.target.value })} />
              <input placeholder="NIF opcional" value={address.nif} onChange={(event) => setAddressState({ ...address, nif: event.target.value })} />
              <input className="span-2" placeholder="Morada" value={address.address} onChange={(event) => setAddressState({ ...address, address: event.target.value })} />
              <input placeholder="Cidade" value={address.city} onChange={(event) => setAddressState({ ...address, city: event.target.value })} />
              <input placeholder="Codigo postal" value={address.zip} onChange={(event) => setAddressState({ ...address, zip: event.target.value })} />
            </div>
          </div></section>

          <section className="card"><div className="card-body">
            <h2>{pt.account.recentOrders}</h2>
            {orders.length === 0 ? (
              <div className="empty-account-block">
                <p className="muted">{pt.account.noOrders}</p>
                <Link href="/loja" className="btn btn-secondary small">Ir para a loja</Link>
              </div>
            ) : orders.map((order) => (
              <div className="order-row" key={order.id}>
                <div><strong>{order.title}</strong><p className="muted">{order.date} | {order.status}</p></div>
                <strong>{money(order.total)}</strong>
              </div>
            ))}
          </div></section>
        </div>

        <aside className="account-side">
          <AuthClient />

          <section className="card"><div className="card-body">
            <div className="account-card-heading">
              <div><span className="tag">Subscricao</span><h2>Proxima caixa</h2></div>
              {subscription ? <span className={`admin-pill ${subscriptionPill(subscription.status)}`}>{subscriptionStatusLabel(subscription.status)}</span> : null}
            </div>
            {subscription && selectedPlan ? (
              <div className="subscription-panel">
                <div className="detail-box">
                  <p><strong>Plano:</strong> {selectedPlan.name}</p>
                  <p><strong>Animal:</strong> {selectedPet?.name || "Sem animal"}</p>
                  <p><strong>Proxima caixa:</strong> {subscription.nextBoxDate}</p>
                  <p><strong>Renovacao:</strong> {subscription.renewalDate}</p>
                  <p><strong>Total:</strong> {money(subscription.price)}</p>
                  {subscription.extras ? <p><strong>Extras:</strong> {subscription.extras}</p> : null}
                </div>
                <div className="account-action-grid">
                  <button className="btn btn-secondary small" onClick={skipNextBox}>Saltar proxima</button>
                  <button className="btn btn-secondary small" onClick={() => updateSubscription({ status: subscription.status === "paused" ? "active" : "paused" })}>{subscription.status === "paused" ? "Retomar" : "Pausar"}</button>
                  <button className="btn btn-secondary small" onClick={() => updateSubscription({ status: "cancelled" })}>Cancelar</button>
                </div>
              </div>
            ) : (
              <p className="muted">Ainda nao existe uma subscricao activa. Pode criar uma caixa personalizada ou guardar aqui o plano preferido.</p>
            )}
            <div className="form-grid account-form">
              <select value={subscription?.plan || plans[0]?.id || ""} onChange={(event) => updateSubscriptionPlan(event.target.value)}>
                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
              </select>
              <select value={subscription?.petId || pets[0]?.id || ""} onChange={(event) => subscription ? updateSubscription({ petId: event.target.value }) : setSubscriptionState({ id: "", status: "active", plan: plans[0]?.id || "", cadence: plans[0]?.cadence || "monthly", petId: event.target.value, nextBoxDate: todayPlus(14), renewalDate: todayPlus(30), price: plans[0]?.price || 0, extras: "" })}>
                {pets.length === 0 ? <option value="">Sem animais</option> : pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
              </select>
              <input type="date" value={subscription?.nextBoxDate || todayPlus(14)} onChange={(event) => subscription ? updateSubscription({ nextBoxDate: event.target.value }) : null} />
              <input type="date" value={subscription?.renewalDate || todayPlus(30)} onChange={(event) => subscription ? updateSubscription({ renewalDate: event.target.value }) : null} />
              <input className="span-2" placeholder="Extras para a proxima caixa" value={subscription?.extras || ""} onChange={(event) => subscription ? updateSubscription({ extras: event.target.value }) : setSubscriptionState({ id: "", status: "active", plan: plans[0]?.id || "", cadence: plans[0]?.cadence || "monthly", petId: pets[0]?.id || "", nextBoxDate: todayPlus(14), renewalDate: todayPlus(30), price: plans[0]?.price || 0, extras: event.target.value })} />
            </div>
            <button className="btn full top-gap" onClick={createOrUpdateSubscription}>{subscription ? "Guardar subscricao" : "Criar subscricao"}</button>
          </div></section>

          <section className="card"><div className="card-body">
            <span className="tag">Ajuda</span>
            <h2>Suporte rapido</h2>
            <div className="account-action-grid">
              <Link href="/contacto" className="btn btn-secondary small">Contactar suporte</Link>
              <Link href="/loja" className="btn btn-secondary small">Adicionar produtos</Link>
              <Link href="/criar-caixa" className="btn btn-secondary small">Alterar caixa</Link>
            </div>
          </div></section>
        </aside>
      </div>
      {message ? <div className="container"><p className="account-toast success-text">{message}</p></div> : null}
    </>
  );
}
