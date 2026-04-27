"use client";

import { useEffect, useMemo, useState } from "react";
import type { Plan } from "@/data/products";
import { loadAdminPlans, loadRemoteConfiguratorSettings } from "@/lib/admin-db";
import { adminStore, type ConfigOption, type ConfiguratorSettings } from "@/lib/admin-store";
import { addToCart } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";
import { useRouter } from "next/navigation";

function firstOption(options: ConfigOption[], fallback: string) {
  return options[0]?.id || fallback;
}

function planLabel(plan: Plan) {
  return plan.cadence === "monthly" ? pt.configure.monthly : pt.configure.quarterly;
}

function getOption(options: ConfigOption[], id: string) {
  return options.find((option) => option.id === id) || options[0];
}

export default function Configurator() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(() => adminStore.plans.get());
  const [settings, setSettings] = useState<ConfiguratorSettings>(() => adminStore.configurator.get());
  const [animalId, setAnimalId] = useState(() => firstOption(adminStore.configurator.get().animals, "dog"));
  const [sizeId, setSizeId] = useState(() => firstOption(adminStore.configurator.get().sizes, "medium"));
  const [ageId, setAgeId] = useState(() => firstOption(adminStore.configurator.get().ages, "adult"));
  const [planId, setPlanId] = useState(() => adminStore.plans.get()[0]?.id || "");
  const [personalityId, setPersonalityId] = useState(() => firstOption(adminStore.configurator.get().personalities, "playful"));
  const [extraIds, setExtraIds] = useState<string[]>(() => adminStore.configurator.get().extras[0]?.id ? [adminStore.configurator.get().extras[0].id] : []);
  const [petNotes, setPetNotes] = useState("");

  useEffect(() => {
    const refresh = () => {
      const nextPlans = adminStore.plans.get();
      const nextSettings = adminStore.configurator.get();

      setPlans(nextPlans);
      setSettings(nextSettings);
      setAnimalId((current) => nextSettings.animals.some((option) => option.id === current) ? current : firstOption(nextSettings.animals, "dog"));
      setSizeId((current) => nextSettings.sizes.some((option) => option.id === current) ? current : firstOption(nextSettings.sizes, "medium"));
      setAgeId((current) => nextSettings.ages.some((option) => option.id === current) ? current : firstOption(nextSettings.ages, "adult"));
      setPlanId((current) => nextPlans.some((plan) => plan.id === current) ? current : nextPlans[0]?.id || "");
      setPersonalityId((current) => nextSettings.personalities.some((option) => option.id === current) ? current : firstOption(nextSettings.personalities, "playful"));
      setExtraIds((current) => current.filter((id) => nextSettings.extras.some((option) => option.id === id)));
    };

    refresh();
    Promise.all([
      loadAdminPlans().catch(() => []),
      loadRemoteConfiguratorSettings(adminStore.configurator.get()).catch(() => null)
    ]).then(([remotePlans, remoteSettings]) => {
      if (remotePlans.length) {
        setPlans(remotePlans);
        adminStore.plans.set(remotePlans);
        setPlanId((current) => remotePlans.some((plan) => plan.id === current) ? current : remotePlans[0]?.id || "");
      }
      if (remoteSettings) {
        setSettings(remoteSettings);
        adminStore.configurator.set(remoteSettings);
        setAnimalId((current) => remoteSettings.animals.some((option) => option.id === current) ? current : firstOption(remoteSettings.animals, "dog"));
        setSizeId((current) => remoteSettings.sizes.some((option) => option.id === current) ? current : firstOption(remoteSettings.sizes, "medium"));
        setAgeId((current) => remoteSettings.ages.some((option) => option.id === current) ? current : firstOption(remoteSettings.ages, "adult"));
        setPersonalityId((current) => remoteSettings.personalities.some((option) => option.id === current) ? current : firstOption(remoteSettings.personalities, "playful"));
        setExtraIds((current) => current.filter((id) => remoteSettings.extras.some((option) => option.id === id)));
      }
    });
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  const animal = getOption(settings.animals, animalId);
  const size = getOption(settings.sizes, sizeId);
  const age = getOption(settings.ages, ageId);
  const selectedPlan = plans.find((plan) => plan.id === planId) || plans[0];
  const personality = getOption(settings.personalities, personalityId);
  const selectedExtras = settings.extras.filter((extra) => extraIds.includes(extra.id));
  const total = (selectedPlan?.price || 0) + (animal?.price || 0) + (size?.price || 0) + (age?.price || 0) + (personality?.price || 0) + selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  const summaryExtras = useMemo(() => selectedExtras.map((extra) => extra.label).join(", ") || "Nenhum", [selectedExtras]);
  const cleanPetNotes = petNotes.trim().replace(/\s+/g, " ").slice(0, 240);

  function toggleExtra(extraId: string) {
    setExtraIds((prev) => prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]);
  }

  function addConfigured(goCheckout = false) {
    if (!selectedPlan || !animal || !size || !age || !personality) return;

    addToCart({
      id: `custom-${Date.now()}`,
      slug: "custom-pet-box",
      title: `${selectedPlan.name} ${animal.label}`,
      price: total,
      quantity: 1,
      type: "custom-box",
      cadence: selectedPlan.cadence,
      species: animal.id,
      category: "Caixa personalizada",
      image: animal.image,
      config: {
        planId: selectedPlan.id,
        animalId: animal.id,
        sizeId: size.id,
        ageId: age.id,
        personalityId: personality.id,
        extraIds: selectedExtras.map((extra) => extra.id).join(","),
        notes: cleanPetNotes
      },
      metadata: { animal: animal.label, tamanho: size.label, idade: age.label, personalidade: personality.label, extras: summaryExtras, observacoes: cleanPetNotes }
    });
    router.push(goCheckout ? "/checkout" : "/cart");
  }

  return (
    <div className="configurator">
      <div className="config-grid">
        <div className="config-panel">
          <div className="config-step">
            <div className="config-step-head"><span>1</span><div><h2>{settings.animalTitle}</h2><p>{settings.animalText}</p></div></div>
            <div className="choice-grid two-choice">
              {settings.animals.map((option) => (
                <button key={option.id} className={`choice-card ${animalId === option.id ? "active" : ""}`} onClick={() => setAnimalId(option.id)}>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                  {option.price ? <em>+{money(option.price)}</em> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="config-step">
            <div className="config-step-head"><span>2</span><div><h2>{settings.sizeTitle}</h2><p>{settings.sizeText}</p></div></div>
            <div className="choice-grid">
              {settings.sizes.map((option) => (
                <button key={option.id} className={`choice-card ${sizeId === option.id ? "active" : ""}`} onClick={() => setSizeId(option.id)}>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                  {option.price ? <em>+{money(option.price)}</em> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="config-step">
            <div className="config-step-head"><span>3</span><div><h2>{settings.ageTitle}</h2><p>{settings.ageText}</p></div></div>
            <div className="choice-grid">
              {settings.ages.map((option) => (
                <button key={option.id} className={`choice-card ${ageId === option.id ? "active" : ""}`} onClick={() => setAgeId(option.id)}>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                  {option.price ? <em>+{money(option.price)}</em> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="config-step">
            <div className="config-step-head"><span>4</span><div><h2>{settings.planTitle}</h2><p>{settings.planText}</p></div></div>
            <div className="choice-grid two-choice">
              {plans.map((plan) => (
                <button key={plan.id} className={`choice-card price-choice ${planId === plan.id ? "active" : ""}`} onClick={() => setPlanId(plan.id)}>
                  <strong>{plan.name}</strong>
                  <span>{money(plan.price)}</span>
                  <small>{planLabel(plan)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="config-step">
            <div className="config-step-head"><span>5</span><div><h2>{settings.personalityTitle}</h2><p>{settings.personalityText}</p></div></div>
            <div className="choice-grid personality-grid">
              {settings.personalities.map((option) => (
                <button key={option.id} className={`choice-card personality-card ${personalityId === option.id ? "active" : ""}`} onClick={() => setPersonalityId(option.id)}>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                  {option.price ? <em>+{money(option.price)}</em> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="config-step">
            <div className="config-step-head"><span>6</span><div><h2>{settings.extrasTitle}</h2><p>{settings.extrasText}</p></div></div>
            <div className="choice-grid extra-card-grid">
              {settings.extras.map((extra) => (
                <button key={extra.id} className={`choice-card extra-choice ${extraIds.includes(extra.id) ? "active" : ""}`} onClick={() => toggleExtra(extra.id)}>
                  <span className="extra-check" aria-hidden="true">{extraIds.includes(extra.id) ? "✓" : ""}</span>
                  <strong>{extra.label}</strong>
                  <span>{extra.description}</span>
                  <em>+{money(extra.price)}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="config-step">
            <div className="config-step-head"><span>7</span><div><h2>Observacoes sobre o animal</h2><p>Conte-nos alergias, gostos, medos ou detalhes importantes.</p></div></div>
            <textarea className="config-notes" rows={4} maxLength={240} value={petNotes} onChange={(event) => setPetNotes(event.target.value)} placeholder="Ex.: alergia a frango, prefere brinquedos resistentes, nao gosta de guizos..." />
            <p className="muted config-note-count">{cleanPetNotes.length}/240 caracteres</p>
          </div>
        </div>

        <aside className="config-summary">
          <div className="summary-media">
            <img src={animal?.image || "/images/dog-box.svg"} alt="Pre-visualizacao da caixa" />
          </div>
          <span className="tag">Resumo em tempo real</span>
          <h3>{selectedPlan?.name || "Caixa PetBox"} {animal?.label || ""}</h3>
          <div className="summary-lines">
            <div><span>Animal</span><strong>{animal?.label}</strong></div>
            <div><span>Tamanho</span><strong>{size?.label}</strong></div>
            <div><span>Idade</span><strong>{age?.label}</strong></div>
            <div><span>Plano</span><strong>{selectedPlan ? planLabel(selectedPlan) : "-"}</strong></div>
            <div><span>Personalidade</span><strong>{personality?.label}</strong></div>
            <div><span>Extras</span><strong>{summaryExtras}</strong></div>
            {cleanPetNotes ? <div><span>Observacoes</span><strong>{cleanPetNotes}</strong></div> : null}
          </div>
          <p className="price">{money(total)}</p>
          <div className="config-summary-actions">
            <button className="btn full" onClick={() => addConfigured(true)}>Comprar agora</button>
            <button className="btn btn-secondary full" onClick={() => addConfigured(false)}>Adicionar ao carrinho</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
