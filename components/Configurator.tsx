"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Plan } from "@/data/products";
import { loadAdminPlans, loadRemoteConfiguratorSettings } from "@/lib/admin-db";
import { adminStore, type ConfigOption, type ConfiguratorSettings } from "@/lib/admin-store";
import { addToCart, clearSelectedPetForBox, getSelectedPetForBox, type AccountPet } from "@/lib/client-store";
import { getConfiguratorVariantImage } from "@/lib/configurator-images";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";
import { useRouter } from "next/navigation";
import SmartImage from "@/components/SmartImage";

function firstOption(options: ConfigOption[], fallback: string) {
  return options[0]?.id || fallback;
}

function planLabel(plan: Plan) {
  return plan.cadence === "monthly" ? pt.configure.monthly : pt.configure.quarterly;
}

function getOption(options: ConfigOption[], id: string) {
  return options.find((option) => option.id === id) || options[0];
}

function hasOption(options: ConfigOption[], id: string) {
  return options.some((option) => option.id === id);
}

function ageIdFromBirthday(birthday: string) {
  if (!birthday) return "adult";
  const birthDate = new Date(birthday);
  if (Number.isNaN(birthDate.getTime())) return "adult";
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassed = today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayPassed) years -= 1;
  if (years < 1) return "young";
  if (years >= 8) return "senior";
  return "adult";
}

function profileDetailsFromPet(pet: AccountPet, personalityLabel: string) {
  const details = [
    personalityLabel ? `Personalidade: ${personalityLabel}` : "",
    (pet.allergies || "").trim() ? `Alergias: ${(pet.allergies || "").trim()}` : "",
    (pet.preferences || "").trim() ? `Preferencias: ${(pet.preferences || "").trim()}` : ""
  ].filter(Boolean);
  return details;
}

type ConfiguratorProps = {
  initialConfiguratorSettings?: Partial<ConfiguratorSettings> | null;
  initialPlans?: Plan[];
};

function initialSettingsFromProps(initialConfiguratorSettings?: Partial<ConfiguratorSettings> | null) {
  const localSettings = adminStore.configurator.get();
  return initialConfiguratorSettings ? ({ ...localSettings, ...initialConfiguratorSettings } as ConfiguratorSettings) : localSettings;
}

function initialPlansFromProps(initialPlans?: Plan[]) {
  return initialPlans?.length ? initialPlans : adminStore.plans.get();
}

function shouldUseAdminPreview() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "admin";
}

export default function Configurator({ initialConfiguratorSettings = null, initialPlans = [] }: ConfiguratorProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(() => initialPlansFromProps(initialPlans));
  const [settings, setSettings] = useState<ConfiguratorSettings>(() => initialSettingsFromProps(initialConfiguratorSettings));
  const [animalId, setAnimalId] = useState(() => firstOption(initialSettingsFromProps(initialConfiguratorSettings).animals, "dog"));
  const [sizeId, setSizeId] = useState(() => firstOption(initialSettingsFromProps(initialConfiguratorSettings).sizes, "medium"));
  const [ageId, setAgeId] = useState(() => firstOption(initialSettingsFromProps(initialConfiguratorSettings).ages, "adult"));
  const [planId, setPlanId] = useState(() => initialPlansFromProps(initialPlans)[0]?.id || "");
  const [personalityId, setPersonalityId] = useState(() => firstOption(initialSettingsFromProps(initialConfiguratorSettings).personalities, "playful"));
  const [extraIds, setExtraIds] = useState<string[]>(() => initialSettingsFromProps(initialConfiguratorSettings).extras[0]?.id ? [initialSettingsFromProps(initialConfiguratorSettings).extras[0].id] : []);
  const [petNotes, setPetNotes] = useState("");
  const [selectedPet, setSelectedPet] = useState<AccountPet | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const selectedPetAppliedRef = useRef("");
  const hasInitialData = Boolean(initialConfiguratorSettings || initialPlans.length);

  useEffect(() => {
    const applySelectedPet = (nextSettings: ConfiguratorSettings) => {
      const pet = getSelectedPetForBox();
      setSelectedPet(pet);
      if (!pet) {
        selectedPetAppliedRef.current = "";
        return;
      }
      if (selectedPetAppliedRef.current === pet.id) return;
      if (hasOption(nextSettings.animals, pet.species)) setAnimalId(pet.species);
      if (hasOption(nextSettings.sizes, pet.size)) setSizeId(pet.size);
      const nextAgeId = ageIdFromBirthday(pet.birthday);
      if (hasOption(nextSettings.ages, nextAgeId)) setAgeId(nextAgeId);
      if (pet.personality && hasOption(nextSettings.personalities, pet.personality)) setPersonalityId(pet.personality);
      selectedPetAppliedRef.current = pet.id;
    };

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
      applySelectedPet(nextSettings);
    };

    if (shouldUseAdminPreview()) {
      setPreviewMode(true);
      refresh();
      window.addEventListener("petbox-admin-changed", refresh);
      window.addEventListener("petbox-selected-pet-changed", refresh);
      return () => {
        window.removeEventListener("petbox-admin-changed", refresh);
        window.removeEventListener("petbox-selected-pet-changed", refresh);
      };
    }

    if (initialPlans.length) {
      adminStore.plans.set(initialPlans);
    }
    if (initialConfiguratorSettings) {
      adminStore.configurator.set(initialSettingsFromProps(initialConfiguratorSettings));
    }

    refresh();
    if (hasInitialData) {
      window.addEventListener("petbox-admin-changed", refresh);
      window.addEventListener("petbox-selected-pet-changed", refresh);
      return () => {
        window.removeEventListener("petbox-admin-changed", refresh);
        window.removeEventListener("petbox-selected-pet-changed", refresh);
      };
    }

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
        applySelectedPet(remoteSettings);
      }
    });
    window.addEventListener("petbox-admin-changed", refresh);
    window.addEventListener("petbox-selected-pet-changed", refresh);
    return () => {
      window.removeEventListener("petbox-admin-changed", refresh);
      window.removeEventListener("petbox-selected-pet-changed", refresh);
    };
  }, []);

  const animal = getOption(settings.animals, animalId);
  const size = getOption(settings.sizes, sizeId);
  const age = getOption(settings.ages, ageId);
  const selectedPlan = plans.find((plan) => plan.id === planId) || plans[0];
  const personality = getOption(settings.personalities, personalityId);
  const selectedExtras = settings.extras.filter((extra) => extraIds.includes(extra.id));
  const selectedPetPersonality = selectedPet?.personality ? settings.personalities.find((option) => option.id === selectedPet.personality) : null;
  const selectedPetDetails = selectedPet ? profileDetailsFromPet(selectedPet, selectedPetPersonality?.label || "") : [];
  const previewImage = getConfiguratorVariantImage(settings, animal, size, age);
  const total = (selectedPlan?.price || 0) + (animal?.price || 0) + (size?.price || 0) + (age?.price || 0) + (personality?.price || 0) + selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  const summaryExtras = useMemo(() => selectedExtras.map((extra) => extra.label).join(", ") || "Nenhum", [selectedExtras]);
  const cleanPetNotes = petNotes.trim().replace(/\s+/g, " ").slice(0, 240);
  const progressSteps = [
    { label: "Animal", value: animal?.label || "-" },
    { label: "Tamanho", value: size?.label || "-" },
    { label: "Idade", value: age?.label || "-" },
    { label: "Plano", value: selectedPlan ? planLabel(selectedPlan) : "-" },
    { label: "Estilo", value: personality?.label || "-" }
  ];

  function toggleExtra(extraId: string) {
    setExtraIds((prev) => prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]);
  }

  function clearSelectedPet() {
    clearSelectedPetForBox();
    selectedPetAppliedRef.current = "";
    setSelectedPet(null);
  }

  function addConfigured(goCheckout = false) {
    if (!selectedPlan || !animal || !size || !age || !personality) return;

    addToCart({
      id: `custom-${Date.now()}`,
      slug: "custom-pet-box",
      title: selectedPet ? `${selectedPlan.name} para ${selectedPet.name}` : `${selectedPlan.name} ${animal.label}`,
      price: total,
      quantity: 1,
      type: "custom-box",
      cadence: selectedPlan.cadence,
      species: animal.id,
      category: "Caixa personalizada",
      image: previewImage,
      config: {
        planId: selectedPlan.id,
        petId: selectedPet?.id || "",
        petName: selectedPet?.name || "",
        petAllergies: selectedPet?.allergies || "",
        petPreferences: selectedPet?.preferences || "",
        animalId: animal.id,
        sizeId: size.id,
        ageId: age.id,
        personalityId: personality.id,
        extraIds: selectedExtras.map((extra) => extra.id).join(","),
        notes: cleanPetNotes
      },
      metadata: {
        perfil: selectedPet?.name || "",
        animal: animal.label,
        tamanho: size.label,
        idade: age.label,
        personalidade: personality.label,
        alergias: selectedPet?.allergies || "",
        preferencias: selectedPet?.preferences || "",
        extras: summaryExtras,
        observacoes: cleanPetNotes
      }
    });
    router.push(goCheckout ? "/pagamento" : "/carrinho");
  }

  return (
    <div className="configurator">
      {previewMode ? <div className="preview-mode-banner">Pre-visualizacao local do admin. Os visitantes so veem isto depois de guardar.</div> : null}
      {selectedPet ? (
        <div className="selected-pet-banner">
          <div>
            <span className="tag">Perfil seleccionado</span>
            <strong>{selectedPet.name}</strong>
            <p>A caixa foi pre-preenchida com animal, tamanho, idade e personalidade. Use as observacoes apenas para notas extra desta encomenda.</p>
            {selectedPetDetails.length ? <div className="selected-pet-detail-row">{selectedPetDetails.map((detail) => <span key={detail}>{detail}</span>)}</div> : null}
          </div>
          <button className="btn btn-secondary small" onClick={clearSelectedPet}>Escolher manualmente</button>
        </div>
      ) : null}
      <div className="config-progress-strip" aria-label="Resumo das escolhas">
        {progressSteps.map((step, index) => (
          <div className="config-progress-item" key={step.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.label}</strong>
            <small>{step.value}</small>
          </div>
        ))}
      </div>
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
            <SmartImage src={previewImage} alt="Pre-visualizacao da caixa" width={620} height={620} sizes="360px" priority />
          </div>
          <span className="tag">Resumo em tempo real</span>
          <h3>{selectedPlan?.name || "Caixa PetBox"} {animal?.label || ""}</h3>
          <div className="summary-pills">
            <span>{animal?.label || "Animal"}</span>
            <span>{size?.label || "Tamanho"}</span>
            <span>{age?.label || "Idade"}</span>
          </div>
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
          <div className="summary-trust-row">
            <span>MB WAY por Easypay</span>
            <span>Extras editaveis</span>
            <span>Perfil guardado</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
