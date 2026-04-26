"use client";

import { useState } from "react";
import { adminStore, type HomeSettings } from "@/lib/admin-store";

const heroPresets = [
  "/images/hero-pets.svg",
  "/images/dog-box.svg",
  "/images/cat-box.svg",
  "/images/about-pets.svg"
];

export default function AdminHomeClient() {
  const [form, setForm] = useState<HomeSettings>(() => adminStore.home.get());
  const [message, setMessage] = useState("");

  function update(field: keyof HomeSettings, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function save() {
    adminStore.home.set(form);
    setMessage("Pagina inicial actualizada.");
  }

  function reset() {
    adminStore.home.reset();
    setForm(adminStore.home.get());
    setMessage("Pagina inicial reposta.");
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Escolha um ficheiro de imagem.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        update("heroImage", result);
        setMessage("Imagem principal adicionada.");
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="admin-card">
      <div className="card-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Pagina inicial</h2>
          <div className="text-muted">Configure o texto, imagem e destaques da primeira pagina.</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="admin-action-btn admin-action-primary" onClick={save}>Guardar</button>
          <button className="admin-action-btn" onClick={reset}>Repor</button>
        </div>
      </div>

      <div className="card-body">
        <div className="row g-4">
          <div className="col-xl-7">
            <div className="row g-3">
              <div className="col-md-4"><label className="form-label fw-bold">Etiqueta</label><input className="admin-form-control" value={form.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} /></div>
              <div className="col-md-8"><label className="form-label fw-bold">Titulo principal</label><input className="admin-form-control" value={form.title} onChange={(event) => update("title", event.target.value)} /></div>
              <div className="col-12"><label className="form-label fw-bold">Subtitulo</label><textarea className="admin-form-control" rows={3} value={form.subtitle} onChange={(event) => update("subtitle", event.target.value)} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Botao principal</label><input className="admin-form-control" value={form.primaryCta} onChange={(event) => update("primaryCta", event.target.value)} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Link principal</label><input className="admin-form-control" value={form.primaryHref} onChange={(event) => update("primaryHref", event.target.value)} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Botao secundario</label><input className="admin-form-control" value={form.secondaryCta} onChange={(event) => update("secondaryCta", event.target.value)} /></div>
              <div className="col-md-6"><label className="form-label fw-bold">Link secundario</label><input className="admin-form-control" value={form.secondaryHref} onChange={(event) => update("secondaryHref", event.target.value)} /></div>
              <div className="col-md-7"><label className="form-label fw-bold">Imagem principal</label><input className="admin-form-control" value={form.heroImage} onChange={(event) => update("heroImage", event.target.value)} /></div>
              <div className="col-md-5"><label className="form-label fw-bold">Carregar imagem</label><input className="admin-form-control" type="file" accept="image/*" onChange={(event) => handleImageFile(event.target.files?.[0])} /></div>
              <div className="col-12"><label className="form-label fw-bold">Imagens rapidas</label><div className="admin-image-presets">{heroPresets.map((image) => <button key={image} className={`admin-image-preset ${form.heroImage === image ? "active" : ""}`} onClick={() => update("heroImage", image)}><img src={image} alt="" /></button>)}</div></div>
            </div>
          </div>

          <div className="col-xl-5">
            <div className="admin-home-preview">
              <span className="eyebrow">{form.eyebrow}</span>
              <h2>{form.title}</h2>
              <p>{form.subtitle}</p>
              <img src={form.heroImage} alt="" />
              <div className="admin-home-stats">
                <div><strong>{form.statOneTitle}</strong><span>{form.statOneText}</span></div>
                <div><strong>{form.statTwoTitle}</strong><span>{form.statTwoText}</span></div>
                <div><strong>{form.statThreeTitle}</strong><span>{form.statThreeText}</span></div>
              </div>
            </div>
          </div>

          <div className="col-12"><hr /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Destaque 1</label><input className="admin-form-control mb-2" value={form.statOneTitle} onChange={(event) => update("statOneTitle", event.target.value)} /><input className="admin-form-control" value={form.statOneText} onChange={(event) => update("statOneText", event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Destaque 2</label><input className="admin-form-control mb-2" value={form.statTwoTitle} onChange={(event) => update("statTwoTitle", event.target.value)} /><input className="admin-form-control" value={form.statTwoText} onChange={(event) => update("statTwoText", event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Destaque 3</label><input className="admin-form-control mb-2" value={form.statThreeTitle} onChange={(event) => update("statThreeTitle", event.target.value)} /><input className="admin-form-control" value={form.statThreeText} onChange={(event) => update("statThreeText", event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Titulo dos planos</label><input className="admin-form-control mb-2" value={form.plansEyebrow} onChange={(event) => update("plansEyebrow", event.target.value)} /><input className="admin-form-control" value={form.plansTitle} onChange={(event) => update("plansTitle", event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Titulo dos produtos</label><input className="admin-form-control mb-2" value={form.productsEyebrow} onChange={(event) => update("productsEyebrow", event.target.value)} /><input className="admin-form-control" value={form.productsTitle} onChange={(event) => update("productsTitle", event.target.value)} /></div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>
    </div>
  );
}
