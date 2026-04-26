"use client";

import { useEffect, useMemo, useState } from "react";
import type { Plan } from "@/data/products";
import { adminStore } from "@/lib/admin-store";
import { addToCart } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { pt } from "@/lib/translations";
import { useRouter } from "next/navigation";

const sizeLabels = { small: "Pequeno", medium: "Medio", large: "Grande" } as const;
const sizeText = { small: "Para animais pequenos ou jovens.", medium: "O equilibrio ideal para a maioria.", large: "Mais volume e brinquedos resistentes." } as const;
const themeLabels = { playful: "Brincalhao", cozy: "Conforto", outdoor: "Aventura", calm: "Calmo" } as const;
const themeText = { playful: "Mais brinquedos e snacks de recompensa.", cozy: "Produtos suaves, descanso e mimo.", outdoor: "Extras resistentes para passeios.", calm: "Opcoes tranquilas e enriquecimento leve." } as const;
const extraLabels = { treats: "Snacks extra", toy: "Brinquedo premium", care: "Produto de cuidado", photo: "Acessorio para fotos" } as const;

function planPrice(plans: Plan[], cadence: "monthly" | "quarterly") {
  return plans.find((plan) => plan.cadence === cadence)?.price || (cadence === "monthly" ? 39 : 99);
}

export default function Configurator() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(() => adminStore.plans.get());
  const [species, setSpecies] = useState<"dog" | "cat">("dog");
  const [size, setSize] = useState<keyof typeof sizeLabels>("medium");
  const [cadence, setCadence] = useState<"monthly" | "quarterly">("monthly");
  const [theme, setTheme] = useState<keyof typeof themeLabels>("playful");
  const [extras, setExtras] = useState<(keyof typeof extraLabels)[]>(["treats"]);

  useEffect(() => {
    const refresh = () => setPlans(adminStore.plans.get());
    refresh();
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  const base = planPrice(plans, cadence);
  const total = base + extras.length * 6;
  const summary = useMemo(() => ({ species, size, cadence, theme, extras: extras.map((extra) => extraLabels[extra]).join(", ") || "Nenhum" }), [species, size, cadence, theme, extras]);

  function toggleExtra(extra: keyof typeof extraLabels) {
    setExtras((prev) => prev.includes(extra) ? prev.filter((item) => item !== extra) : [...prev, extra]);
  }

  function addConfigured(goCheckout = false) {
    addToCart({
      id: `custom-${Date.now()}`,
      slug: "custom-pet-box",
      title: `${cadence === "monthly" ? "Caixa Mensal" : "Caixa Trimestral"} ${species === "dog" ? "Cao" : "Gato"}`,
      price: total,
      quantity: 1,
      type: "custom-box",
      cadence,
      species,
      category: "Caixa personalizada",
      metadata: { tamanho: sizeLabels[size], tema: themeLabels[theme], extras: summary.extras }
    });
    router.push(goCheckout ? "/checkout" : "/cart");
  }

  return (
    <div className="configurator">
      <div className="config-grid">
        <div className="config-panel">
          <div className="config-step">
            <div className="config-step-head"><span>1</span><div><h2>Escolha o animal</h2><p>Adaptamos os produtos ao perfil da caixa.</p></div></div>
            <div className="choice-grid two-choice">
              {(["dog", "cat"] as const).map((value) => (
                <button key={value} className={`choice-card ${species === value ? "active" : ""}`} onClick={() => setSpecies(value)}>
                  <strong>{value === "dog" ? pt.configure.dog : pt.configure.cat}</strong>
                  <span>{value === "dog" ? "Snacks, brinquedos de roer e aventura." : "Brinquedos interactivos, snacks e conforto."}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="config-step">
            <div className="config-step-head"><span>2</span><div><h2>Tamanho e plano</h2><p>O preco base vem dos planos que configurar no admin.</p></div></div>
            <div className="choice-grid">
              {Object.entries(sizeLabels).map(([value, label]) => (
                <button key={value} className={`choice-card ${size === value ? "active" : ""}`} onClick={() => setSize(value as keyof typeof sizeLabels)}>
                  <strong>{label}</strong>
                  <span>{sizeText[value as keyof typeof sizeText]}</span>
                </button>
              ))}
            </div>
            <div className="choice-grid two-choice mt-3">
              {(["monthly", "quarterly"] as const).map((value) => (
                <button key={value} className={`choice-card price-choice ${cadence === value ? "active" : ""}`} onClick={() => setCadence(value)}>
                  <strong>{value === "monthly" ? pt.configure.monthly : pt.configure.quarterly}</strong>
                  <span>{money(planPrice(plans, value))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="config-step">
            <div className="config-step-head"><span>3</span><div><h2>Personalidade e extras</h2><p>Defina o estilo da caixa e adicione extras opcionais.</p></div></div>
            <div className="choice-grid">
              {Object.entries(themeLabels).map(([value, label]) => (
                <button key={value} className={`choice-card ${theme === value ? "active" : ""}`} onClick={() => setTheme(value as keyof typeof themeLabels)}>
                  <strong>{label}</strong>
                  <span>{themeText[value as keyof typeof themeText]}</span>
                </button>
              ))}
            </div>
            <div className="check-grid config-extra-grid">
              {Object.entries(extraLabels).map(([value, label]) => (
                <label key={value} className={`check-item ${extras.includes(value as keyof typeof extraLabels) ? "active" : ""}`}>
                  <input type="checkbox" checked={extras.includes(value as keyof typeof extraLabels)} onChange={() => toggleExtra(value as keyof typeof extraLabels)} />
                  <span>{label}</span>
                  <strong>+6,00 €</strong>
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="config-summary">
          <div className="summary-media">
            <img src={species === "dog" ? "/images/dog-box.svg" : "/images/cat-box.svg"} alt="Pre-visualizacao da caixa" />
          </div>
          <span className="tag">Resumo em tempo real</span>
          <h3>{cadence === "monthly" ? "Caixa Mensal" : "Caixa Trimestral"} {species === "dog" ? "Cao" : "Gato"}</h3>
          <div className="summary-lines">
            <div><span>Tamanho</span><strong>{sizeLabels[summary.size]}</strong></div>
            <div><span>Tema</span><strong>{themeLabels[summary.theme]}</strong></div>
            <div><span>Extras</span><strong>{summary.extras}</strong></div>
            <div><span>Plano</span><strong>{summary.cadence === "monthly" ? pt.configure.monthly : pt.configure.quarterly}</strong></div>
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
