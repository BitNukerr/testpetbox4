"use client";

import { useMemo, useState } from "react";
import { addToCart } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { useRouter } from "next/navigation";
import { pt } from "@/lib/translations";

const labels = {
  species: { dog: pt.configure.dog, cat: pt.configure.cat },
  size: { small: pt.configure.small, medium: pt.configure.medium, large: pt.configure.large },
  cadence: { monthly: pt.configure.monthly, quarterly: pt.configure.quarterly },
  theme: { playful: pt.configure.playful, cozy: pt.configure.cozy, outdoor: pt.configure.outdoor, calm: pt.configure.calm },
  extras: { treats: pt.configure.treats, "toy upgrade": pt.configure.toyUpgrade, "care item": pt.configure.careItem, "photo accessory": pt.configure.photoAccessory }
};

export default function Configurator() {
  const router = useRouter();
  const [species, setSpecies] = useState<"dog" | "cat">("dog");
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [cadence, setCadence] = useState<"monthly" | "quarterly">("monthly");
  const [theme, setTheme] = useState<"playful" | "cozy" | "outdoor" | "calm">("playful");
  const [extras, setExtras] = useState<string[]>(["treats"]);

  const base = cadence === "monthly" ? 39 : 99;
  const extraPrice = extras.length * 6;
  const total = base + extraPrice;

  const summary = useMemo(() => ({
    species: labels.species[species],
    size: labels.size[size],
    cadence: labels.cadence[cadence],
    theme: labels.theme[theme],
    extras: extras.map((item) => labels.extras[item as keyof typeof labels.extras]).join(", ") || "Sem extras"
  }), [species, size, cadence, theme, extras]);

  function toggleExtra(extra: string) {
    setExtras((prev) => prev.includes(extra) ? prev.filter((item) => item !== extra) : [...prev, extra]);
  }

  function addConfigured(goCheckout = false) {
    addToCart({
      id: `custom-${Date.now()}`,
      slug: "caixa-personalizada",
      title: `${summary.cadence} PetBox ${summary.species}`,
      price: total,
      quantity: 1,
      type: "custom-box",
      cadence,
      species,
      category: "Caixa personalizada",
      metadata: { tamanho: summary.size, tema: summary.theme, extras: summary.extras }
    });
    router.push(goCheckout ? "/checkout" : "/cart");
  }

  return (
    <div className="configurator">
      <div className="config-progress">{pt.configure.steps.map((step, index) => <span key={step}><strong>{index + 1}</strong>{step}</span>)}</div>
      <div className="config-grid">
        <div className="card">
          <div className="card-body">
            <h2>{pt.configure.title}</h2>
            <p className="muted">{pt.configure.intro}</p>

            <div className="field-block"><label>{pt.configure.petType}</label><div className="option-grid two-options">
              {(["dog", "cat"] as const).map((value) => <button key={value} className={`choice-card ${species === value ? "active" : ""}`} onClick={() => setSpecies(value)}><img src={value === "dog" ? "/images/dog-box.svg" : "/images/cat-box.svg"} alt="" /><strong>{labels.species[value]}</strong></button>)}
            </div></div>

            <div className="field-block"><label>{pt.configure.petSize}</label><div className="pill-row">
              {(["small", "medium", "large"] as const).map((value) => <button key={value} className={`pill ${size === value ? "active" : ""}`} onClick={() => setSize(value)}>{labels.size[value]}</button>)}
            </div></div>

            <div className="field-block"><label>{pt.configure.delivery}</label><div className="pill-row">
              {(["monthly", "quarterly"] as const).map((value) => <button key={value} className={`pill ${cadence === value ? "active" : ""}`} onClick={() => setCadence(value)}>{labels.cadence[value]}</button>)}
            </div></div>

            <div className="field-block"><label>{pt.configure.theme}</label><div className="pill-row">
              {(["playful", "cozy", "outdoor", "calm"] as const).map((value) => <button key={value} className={`pill ${theme === value ? "active" : ""}`} onClick={() => setTheme(value)}>{labels.theme[value]}</button>)}
            </div></div>

            <div className="field-block"><label>{pt.configure.extras}</label><div className="check-grid">
              {Object.entries(labels.extras).map(([value, label]) => <label key={value} className="check-item"><input type="checkbox" checked={extras.includes(value)} onChange={() => toggleExtra(value)} /><span>{label}</span></label>)}
            </div></div>

            <div className="action-row wrap"><button className="btn" onClick={() => addConfigured(false)}>{pt.configure.add}</button><button className="btn btn-secondary" onClick={() => addConfigured(true)}>{pt.configure.buy}</button></div>
          </div>
        </div>

        <div className="card preview-card">
          <div className="card-body">
            <img src={species === "dog" ? "/images/dog-box.svg" : "/images/cat-box.svg"} alt="Pré-visualização da caixa" className="preview-image" />
            <span className="tag">{pt.configure.liveSummary}</span>
            <h3>{summary.cadence} PetBox {summary.species}</h3>
            <ul className="summary-list"><li><strong>Tamanho:</strong> {summary.size}</li><li><strong>Tema:</strong> {summary.theme}</li><li><strong>Extras:</strong> {summary.extras}</li><li><strong>Entrega:</strong> {summary.cadence}</li></ul>
            <p className="price">{money(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
