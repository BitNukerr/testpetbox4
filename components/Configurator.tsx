"use client";

import { useMemo, useState } from "react";
import { addToCart } from "@/lib/client-store";
import { money } from "@/lib/helpers";
import { useRouter } from "next/navigation";
import { pt } from "@/lib/translations";

const sizeLabels = { small: "Pequeno", medium: "Médio", large: "Grande" } as const;
const themeLabels = { playful: "Brincalhão", cozy: "Conforto", outdoor: "Aventura", calm: "Calmo" } as const;
const extraLabels = { treats: "Snacks extra", toy: "Brinquedo premium", care: "Produto de cuidado", photo: "Acessório para fotos" } as const;

export default function Configurator() {
  const router = useRouter();
  const [species, setSpecies] = useState<"dog" | "cat">("dog");
  const [size, setSize] = useState<keyof typeof sizeLabels>("medium");
  const [cadence, setCadence] = useState<"monthly" | "quarterly">("monthly");
  const [theme, setTheme] = useState<keyof typeof themeLabels>("playful");
  const [extras, setExtras] = useState<(keyof typeof extraLabels)[]>(["treats"]);
  const base = cadence === "monthly" ? 39 : 99;
  const total = base + extras.length * 6;
  const summary = useMemo(() => ({ species, size, cadence, theme, extras: extras.map((extra) => extraLabels[extra]).join(", ") || "Nenhum" }), [species, size, cadence, theme, extras]);

  function toggleExtra(extra: keyof typeof extraLabels) {
    setExtras((prev) => prev.includes(extra) ? prev.filter((item) => item !== extra) : [...prev, extra]);
  }

  function addConfigured(goCheckout = false) {
    addToCart({
      id: `custom-${Date.now()}`,
      slug: "custom-pet-box",
      title: `${cadence === "monthly" ? "Caixa Mensal" : "Caixa Trimestral"} ${species === "dog" ? "Cão" : "Gato"}`,
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
        <div className="card"><div className="card-body">
          <h2>Crie a caixa ideal para o seu animal</h2>
          <div className="field-block"><label>Tipo de animal</label><div className="pill-row">{(["dog", "cat"] as const).map((value) => <button key={value} className={`pill ${species === value ? "active" : ""}`} onClick={() => setSpecies(value)}>{value === "dog" ? pt.configure.dog : pt.configure.cat}</button>)}</div></div>
          <div className="field-block"><label>Tamanho</label><div className="pill-row">{Object.entries(sizeLabels).map(([value, label]) => <button key={value} className={`pill ${size === value ? "active" : ""}`} onClick={() => setSize(value as keyof typeof sizeLabels)}>{label}</button>)}</div></div>
          <div className="field-block"><label>Plano</label><div className="pill-row">{(["monthly", "quarterly"] as const).map((value) => <button key={value} className={`pill ${cadence === value ? "active" : ""}`} onClick={() => setCadence(value)}>{value === "monthly" ? pt.configure.monthly : pt.configure.quarterly}</button>)}</div></div>
          <div className="field-block"><label>Personalidade da caixa</label><div className="pill-row">{Object.entries(themeLabels).map(([value, label]) => <button key={value} className={`pill ${theme === value ? "active" : ""}`} onClick={() => setTheme(value as keyof typeof themeLabels)}>{label}</button>)}</div></div>
          <div className="field-block"><label>Extras</label><div className="check-grid">{Object.entries(extraLabels).map(([value, label]) => <label key={value} className="check-item"><input type="checkbox" checked={extras.includes(value as keyof typeof extraLabels)} onChange={() => toggleExtra(value as keyof typeof extraLabels)} /><span>{label}</span></label>)}</div></div>
          <div className="action-row wrap"><button className="btn" onClick={() => addConfigured(false)}>Adicionar caixa</button><button className="btn btn-secondary" onClick={() => addConfigured(true)}>Comprar agora</button></div>
        </div></div>
        <div className="card preview-card"><div className="card-body">
          <img src={species === "dog" ? "/images/dog-box.svg" : "/images/cat-box.svg"} alt="Pré-visualização da caixa" className="preview-image" />
          <span className="tag">Resumo em tempo real</span>
          <h3>{cadence === "monthly" ? "Caixa Mensal" : "Caixa Trimestral"} {species === "dog" ? "Cão" : "Gato"}</h3>
          <ul className="summary-list"><li><strong>Tamanho:</strong> {sizeLabels[summary.size]}</li><li><strong>Tema:</strong> {themeLabels[summary.theme]}</li><li><strong>Extras:</strong> {summary.extras}</li><li><strong>Plano:</strong> {summary.cadence === "monthly" ? pt.configure.monthly : pt.configure.quarterly}</li></ul>
          <p className="price">{money(total)}</p>
        </div></div>
      </div>
    </div>
  );
}
