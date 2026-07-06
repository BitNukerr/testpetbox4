"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthClient from "@/components/AuthClient";
import type { Plan } from "@/data/products";
import { deleteRemotePet, loadRemoteAccount, saveRemoteAddress, saveRemotePet, saveRemoteProfile } from "@/lib/account-db";
import { adminStore, type ConfigOption } from "@/lib/admin-store";
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
  setSelectedPetForBox,
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
  personality: "",
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

function petSpeciesLabel(value: AccountPet["species"]) {
  return value === "dog" ? "Cao" : "Gato";
}

function petSizeLabel(value: AccountPet["size"]) {
  if (value === "small") return "Pequeno";
  if (value === "large") return "Grande";
  return "Medio";
}

function petPersonalityLabel(value: string | undefined, personalities: ConfigOption[]) {
  if (!value) return "Por definir";
  return personalities.find((option) => option.id === value)?.label || value;
}

function petAgeYears(birthday: string) {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassed = today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayPassed) years -= 1;
  return Math.max(0, years);
}

function petAgeStage(pet: AccountPet) {
  const years = petAgeYears(pet.birthday);
  if (years === null) return "adult";
  if (years < 1) return "young";
  if (years >= 8) return "senior";
  return "adult";
}

function petAgeLabel(pet: AccountPet) {
  const stage = petAgeStage(pet);
  if (stage === "young") return "Jovem";
  if (stage === "senior") return "Senior";
  return "Adulto";
}

function petAgeDetail(pet: AccountPet) {
  const years = petAgeYears(pet.birthday);
  if (years === null) return "Idade por confirmar";
  if (years === 0) return "Menos de 1 ano";
  if (years === 1) return "1 ano";
  return `${years} anos`;
}

function petRecommendation(pet: AccountPet, personalityLabel: string) {
  const stage = petAgeStage(pet);
  const hasCareNotes = Boolean((pet.allergies || "").trim() || (pet.preferences || "").trim());
  const careSuffix = hasCareNotes ? " As notas guardadas entram no resumo da caixa." : " Pode adicionar gostos ou alergias para afinar melhor.";
  const personalitySuffix = pet.personality ? ` Personalidade: ${personalityLabel}.` : "";

  if (pet.species === "cat") {
    if (stage === "young") {
      return {
        title: "Caixa de descoberta para gato jovem",
        text: `Boa para brinquedos leves, snacks simples e enriquecimento em casa.${personalitySuffix}${careSuffix}`
      };
    }
    if (stage === "senior") {
      return {
        title: "Caixa calma para gato senior",
        text: `Focada em conforto, brincadeiras suaves e produtos faceis de usar.${personalitySuffix}${careSuffix}`
      };
    }
    return {
      title: "Caixa de enriquecimento para gato",
      text: `Ideal para variar brinquedos, snacks e rotinas sem ter de escolher tudo de raiz.${personalitySuffix}${careSuffix}`
    };
  }

  if (stage === "young") {
    return {
      title: "Caixa de descoberta para cao jovem",
      text: `Pensada para treino, mordedores adequados e snacks para primeiras rotinas.${personalitySuffix}${careSuffix}`
    };
  }
  if (stage === "senior") {
    return {
      title: "Caixa conforto para cao senior",
      text: `Mais suave, com foco em snacks, brinquedos tranquilos e bem-estar diario.${personalitySuffix}${careSuffix}`
    };
  }
  return {
    title: "Caixa activa por perfil",
    text: `Combina brinquedos, snacks e extras com o tamanho e preferencias guardadas.${personalitySuffix}${careSuffix}`
  };
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

export default function AccountClient({ requireAuth = false }: { requireAuth?: boolean }) {
  const router = useRouter();
  const [orders, setOrders] = useState<ReturnType<typeof getOrders>>([]);
  const [pets, setPetsState] = useState<AccountPet[]>([]);
  const [petForm, setPetForm] = useState<AccountPet>(emptyPet);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [address, setAddressState] = useState<AccountAddress>(emptyAddress);
  const [subscription, setSubscriptionState] = useState<AccountSubscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>(() => adminStore.plans.get());
  const [personalities, setPersonalities] = useState<ConfigOption[]>(() => adminStore.configurator.get().personalities);
  const [user, setUser] = useState<UserState>(null);
  const [profileName, setProfileName] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [message, setMessage] = useState("");
  const unauthenticatedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const nextActions = useMemo(() => [
    {
      title: "Completar perfil",
      text: profileName.trim() ? "Nome da conta guardado." : "Adicione o nome que quer usar nas encomendas.",
      href: "#perfil",
      done: Boolean(profileName.trim())
    },
    {
      title: "Guardar morada",
      text: address.address && address.city && address.zip ? "Morada pronta para o checkout." : "Guarde a morada para acelerar a proxima compra.",
      href: "#morada",
      done: Boolean(address.address && address.city && address.zip)
    },
    {
      title: "Adicionar animal",
      text: pets.length ? `${pets.length} perfil${pets.length === 1 ? "" : "s"} de animal guardado${pets.length === 1 ? "" : "s"}.` : "Crie um perfil para personalizar melhor a caixa.",
      href: "#animais",
      done: pets.length > 0
    },
    {
      title: "Criar caixa",
      text: subscription ? "Subscricao activa associada a conta." : "Escolha um plano e personalize a primeira caixa.",
      href: "/criar-caixa",
      done: Boolean(subscription)
    }
  ], [address.address, address.city, address.zip, pets.length, profileName, subscription]);
  const deliveryReady = Boolean(address.name && address.phone && address.address && address.city && address.zip);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuthChecked(true);
      return;
    }

    let mounted = true;

    const clearUnauthenticatedTimer = () => {
      if (unauthenticatedTimer.current) {
        clearTimeout(unauthenticatedTimer.current);
        unauthenticatedTimer.current = null;
      }
    };

    const applySession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"], immediateMissingSession = false) => {
      if (!mounted) return;
      clearUnauthenticatedTimer();
      if (!session?.user) {
        const applyMissingSession = () => {
          if (!mounted) return;
          setUser(null);
          setProfileName("");
          setAuthChecked(true);
        };
        const missingSessionDelay = requireAuth ? 900 : 0;
        if (immediateMissingSession || !missingSessionDelay) {
          applyMissingSession();
          return;
        }
        unauthenticatedTimer.current = setTimeout(applyMissingSession, missingSessionDelay);
        return;
      }

      const metadata = session.user.user_metadata || {};
      const name = typeof metadata.full_name === "string" ? metadata.full_name : typeof metadata.name === "string" ? metadata.name : "";
      setUser({ id: session.user.id, email: session.user.email || "", name, createdAt: session.user.created_at });
      setProfileName(name);
      setAuthChecked(true);
    };

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      applySession(session, event === "SIGNED_OUT");
    });

    return () => {
      mounted = false;
      clearUnauthenticatedTimer();
      listener.subscription.unsubscribe();
    };
  }, [requireAuth]);

  useEffect(() => {
    if (requireAuth && authChecked && !user) {
      router.replace("/entrar");
    }
  }, [authChecked, requireAuth, router, user]);

  useEffect(() => {
    const refreshOrders = () => setOrders(getOrders(accountScope));
    const refreshAccount = () => {
      setPetsState(getPets(accountScope));
      setAddressState(getAddress(accountScope));
      setSubscriptionState(getSubscription(accountScope));
    };
    const refreshAdmin = () => {
      setPlans(adminStore.plans.get());
      setPersonalities(adminStore.configurator.get().personalities);
    };

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

    const pet = { ...emptyPet, ...petForm, id: petForm.id || `pet-${Date.now()}` };
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

  function startBoxForPet(pet: AccountPet) {
    setSelectedPetForBox(pet);
    router.push(`/criar-caixa?animal=${encodeURIComponent(pet.id)}`);
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

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/entrar");
  }

  if (requireAuth && (!authChecked || !user)) {
    return <div className="account-auth-guard" aria-hidden="true" />;
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
        <div className="account-stat"><span>Dados</span><strong>{deliveryReady ? "Prontos" : "Em falta"}</strong></div>
      </div>

      <div className="container">
        <section className="card account-next-card"><div className="card-body">
          <div className="account-card-heading">
            <div>
              <span className="tag">Proximos passos</span>
              <h2>Prepare a conta para comprar mais rapido</h2>
              <p className="muted mb-0">{remoteReady ? "Dados sincronizados com a sua conta." : "Alguns dados podem estar guardados apenas neste browser."}</p>
            </div>
            <span className={`admin-pill ${remoteReady ? "admin-pill-success" : "admin-pill-warning"}`}>{remoteReady ? "Sincronizado" : "Modo local"}</span>
          </div>
          <div className="account-next-grid">
            {nextActions.map((action) => (
              <Link href={action.href} className={action.done ? "account-next-item done" : "account-next-item"} key={action.title}>
                <span>{action.done ? "Feito" : "Pendente"}</span>
                <strong>{action.title}</strong>
                <p>{action.text}</p>
              </Link>
            ))}
          </div>
        </div></section>
      </div>

      <div className="container">
        <section className="card account-profile-card" id="perfil"><div className="card-body">
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
          <section className="card" id="animais"><div className="card-body">
            <div className="account-card-heading">
              <div><span className="tag">Perfis</span><h2>Animais</h2></div>
              <button className="btn btn-secondary small" onClick={() => { setPetForm(emptyPet); setEditingPetId(null); }}>Novo animal</button>
            </div>
            <div className="pet-grid">
              {pets.length === 0 ? <p className="muted">Adicione o primeiro animal para personalizar as caixas.</p> : pets.map((pet) => (
                <article className="pet-profile" key={pet.id}>
                  <div>
                    <strong>{pet.name}</strong>
                    <span>{petSpeciesLabel(pet.species)} | {petSizeLabel(pet.size)} | {petAgeLabel(pet)}</span>
                    <small>{petAgeDetail(pet)}</small>
                    <small>Personalidade: {petPersonalityLabel(pet.personality, personalities)}</small>
                    {pet.allergies ? <small>Alergias: {pet.allergies}</small> : null}
                    {pet.preferences ? <small>Preferencias: {pet.preferences}</small> : null}
                  </div>
                  <div className="action-row wrap">
                    <button className="btn btn-secondary small" onClick={() => startBoxForPet(pet)}>Criar caixa</button>
                    <button className="link-btn" onClick={() => editPet(pet)}>Editar</button>
                    <button className="link-btn remove-btn" onClick={() => deletePet(pet.id)}>Remover</button>
                  </div>
                </article>
              ))}
            </div>
            {pets.length ? (
              <div className="pet-recommendation-grid">
                {pets.map((pet) => {
                  const personalityLabel = petPersonalityLabel(pet.personality, personalities);
                  const recommendation = petRecommendation(pet, personalityLabel);
                  return (
                    <article className="pet-recommendation-card" key={`recommendation-${pet.id}`}>
                      <span>{pet.name} | {petSpeciesLabel(pet.species)} | {petAgeLabel(pet)} | {personalityLabel}</span>
                      <strong>{recommendation.title}</strong>
                      <p>{recommendation.text}</p>
                      <button className="btn small" onClick={() => startBoxForPet(pet)}>Criar caixa para {pet.name}</button>
                    </article>
                  );
                })}
              </div>
            ) : null}
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
              <select className="span-2" value={petForm.personality || ""} onChange={(event) => setPetForm({ ...petForm, personality: event.target.value })}>
                <option value="">Personalidade por definir</option>
                {personalities.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
              </select>
              <input className="span-2" placeholder="Alergias ou ingredientes a evitar" value={petForm.allergies} onChange={(event) => setPetForm({ ...petForm, allergies: event.target.value })} />
              <input className="span-2" placeholder="Preferencias de brinquedos, snacks ou estilo" value={petForm.preferences} onChange={(event) => setPetForm({ ...petForm, preferences: event.target.value })} />
            </div>
            <button className="btn top-gap" onClick={savePet}>{editingPetId ? "Guardar animal" : "Adicionar animal"}</button>
          </div></section>

          <section className="card" id="morada"><div className="card-body">
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
          <section className="card auth-card"><div className="card-body auth-signed-in">
            <span className="tag">Conta activa</span>
            <h2>{pt.account.authTitle}</h2>
            <p className="muted">{pt.account.signedInAs} <strong>{user.email}</strong></p>
            <div className="action-row wrap">
              <button className="btn btn-secondary" onClick={signOut}>{pt.account.signOut}</button>
            </div>
          </div></section>

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
                  <Link href="/contacto" className="btn btn-secondary small">Pedir alteracao</Link>
                  <Link href="/criar-caixa" className="btn btn-secondary small">Criar nova caixa</Link>
                </div>
              </div>
            ) : (
              <div className="empty-account-block">
                <p className="muted">Ainda nao existe uma subscricao activa. As subscricoes aparecem aqui depois de um pagamento confirmado ou quando forem criadas no admin.</p>
                <Link href="/criar-caixa" className="btn btn-secondary small">Criar caixa</Link>
              </div>
            )}
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
