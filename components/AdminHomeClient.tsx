"use client";

import { useEffect, useState } from "react";
import { AdminImageField, AdminImageListField } from "@/components/AdminImageField";
import { loadRemoteHomeSettings, saveRemoteHomeSettings } from "@/lib/admin-db";
import { adminStore, type HomeSettings } from "@/lib/admin-store";

const heroPresets = [
  "/images/hero-pets.svg",
  "/images/dog-box.svg",
  "/images/cat-box.svg",
  "/images/about-pets.svg",
  "/images/dog-treats.svg",
  "/images/cat-toy.svg",
  "/images/rope-toy.svg",
  "/dog-paw.png"
];

type FieldName = keyof HomeSettings;

const campaignBoxes: Array<{
  title: string;
  label: FieldName;
  heading: FieldName;
  text: FieldName;
  cta: FieldName;
  href: FieldName;
  image: FieldName;
}> = [
  {
    title: "Cartao azul principal",
    label: "showcasePromoLabel",
    heading: "showcasePromoTitle",
    text: "showcasePromoText",
    cta: "showcasePromoCta",
    href: "showcasePromoHref",
    image: "showcasePromoImage"
  },
  {
    title: "Bloco 1",
    label: "showcaseTileOneLabel",
    heading: "showcaseTileOneTitle",
    text: "showcaseTileOneText",
    cta: "showcaseTileOneCta",
    href: "showcaseTileOneHref",
    image: "showcaseTileOneImage"
  },
  {
    title: "Bloco 2",
    label: "showcaseTileTwoLabel",
    heading: "showcaseTileTwoTitle",
    text: "showcaseTileTwoText",
    cta: "showcaseTileTwoCta",
    href: "showcaseTileTwoHref",
    image: "showcaseTileTwoImage"
  },
  {
    title: "Bloco 3",
    label: "showcaseTileThreeLabel",
    heading: "showcaseTileThreeTitle",
    text: "showcaseTileThreeText",
    cta: "showcaseTileThreeCta",
    href: "showcaseTileThreeHref",
    image: "showcaseTileThreeImage"
  },
  {
    title: "Bloco 4 - Blog/novidades",
    label: "showcaseTileFourLabel",
    heading: "showcaseTileFourTitle",
    text: "showcaseTileFourText",
    cta: "showcaseTileFourCta",
    href: "showcaseTileFourHref",
    image: "showcaseTileFourImage"
  }
];

export default function AdminHomeClient() {
  const [form, setForm] = useState<HomeSettings>(() => adminStore.home.get());
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRemoteHomeSettings(adminStore.home.get())
      .then((settings) => {
        setForm(settings);
        adminStore.home.set(settings);
      })
      .catch(() => null);
  }, []);

  function update(field: FieldName, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    let remoteSaved = true;
    try {
      await saveRemoteHomeSettings(form);
    } catch {
      remoteSaved = false;
    }
    adminStore.home.set(form);
    setMessage(remoteSaved ? "Pagina inicial actualizada." : "Pagina guardada localmente. Confirme que o Supabase/RLS esta configurado.");
  }

  function reset() {
    adminStore.home.reset();
    setForm(adminStore.home.get());
    setMessage("Pagina inicial reposta.");
  }

  function ImageControls({ field }: { field: FieldName }) {
    return <AdminImageField value={String(form[field] || "")} onChange={(value) => update(field, value)} onMessage={setMessage} presets={heroPresets} options={{ width: 900, height: 650, fit: "contain" }} />;
  }

  function PreviewTile({ box, variant }: { box: (typeof campaignBoxes)[number]; variant: "promo" | "green" | "cream" | "blue" | "blog" }) {
    return (
      <div className={`admin-home-preview-tile ${variant}`}>
        <div>
          <span>{String(form[box.label] || "")}</span>
          <strong>{String(form[box.heading] || "")}</strong>
          <p>{String(form[box.text] || "")}</p>
          <em>{String(form[box.cta] || "")}</em>
        </div>
        <img src={String(form[box.image] || form.heroImage)} alt="" />
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="card-header admin-save-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Pagina inicial</h2>
          <div className="text-muted">Configure textos, imagens e links dos blocos da primeira pagina.</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="admin-action-btn admin-action-primary" onClick={save}>Guardar</button>
          <button className="admin-action-btn" onClick={reset}>Repor</button>
        </div>
      </div>

      <div className="card-body">
        <div className="row g-4">
          <div className="col-xl-7">
            <div className="admin-config-group mb-3">
              <div className="admin-config-group-head">
                <div><h3>Bloco animado principal</h3><p>Controla o primeiro bloco grande da homepage.</p></div>
              </div>
              <div className="row g-3">
                <div className="col-md-7"><label className="form-label fw-bold">Titulo</label><input className="admin-form-control" value={form.showcaseLeadTitle} onChange={(event) => update("showcaseLeadTitle", event.target.value)} /></div>
                <div className="col-md-5"><label className="form-label fw-bold">Link</label><input className="admin-form-control" value={form.showcaseLeadHref} onChange={(event) => update("showcaseLeadHref", event.target.value)} /></div>
                <div className="col-12"><label className="form-label fw-bold">Texto</label><textarea className="admin-form-control" rows={2} value={form.showcaseLeadText} onChange={(event) => update("showcaseLeadText", event.target.value)} /></div>
                <div className="col-12">
                  <label className="form-label fw-bold">Imagens animadas</label>
                  <AdminImageListField value={form.showcaseLeadImages} onChange={(value) => update("showcaseLeadImages", value)} onMessage={setMessage} presets={heroPresets} options={{ width: 520, height: 520, fit: "contain" }} />
                  <div className="text-muted small mt-2">Pode escolher varias imagens, remover com X e ordenar com as setas. Cada imagem e ajustada sem cortar.</div>
                </div>
              </div>
            </div>

            <div className="admin-config-group">
              <div className="admin-config-group-head">
                <div><h3>Texto geral</h3><p>Usado por outras areas da pagina e conteudos antigos.</p></div>
              </div>
              <div className="row g-3">
                <div className="col-md-4"><label className="form-label fw-bold">Etiqueta</label><input className="admin-form-control" value={form.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} /></div>
                <div className="col-md-8"><label className="form-label fw-bold">Titulo principal</label><input className="admin-form-control" value={form.title} onChange={(event) => update("title", event.target.value)} /></div>
                <div className="col-12"><label className="form-label fw-bold">Subtitulo</label><textarea className="admin-form-control" rows={3} value={form.subtitle} onChange={(event) => update("subtitle", event.target.value)} /></div>
                <div className="col-md-6"><label className="form-label fw-bold">Botao principal</label><input className="admin-form-control" value={form.primaryCta} onChange={(event) => update("primaryCta", event.target.value)} /></div>
                <div className="col-md-6"><label className="form-label fw-bold">Link principal</label><input className="admin-form-control" value={form.primaryHref} onChange={(event) => update("primaryHref", event.target.value)} /></div>
                <div className="col-md-6"><label className="form-label fw-bold">Botao secundario</label><input className="admin-form-control" value={form.secondaryCta} onChange={(event) => update("secondaryCta", event.target.value)} /></div>
                <div className="col-md-6"><label className="form-label fw-bold">Link secundario</label><input className="admin-form-control" value={form.secondaryHref} onChange={(event) => update("secondaryHref", event.target.value)} /></div>
                <div className="col-12"><label className="form-label fw-bold">Imagem geral</label><ImageControls field="heroImage" /></div>
              </div>
            </div>
          </div>

          <div className="col-xl-5">
            <div className="admin-home-preview">
              <div className="admin-home-preview-head">
                <span className="eyebrow">Pre-visualizacao</span>
                <h2>Homepage</h2>
                <p>Veja como os blocos ficam antes de guardar.</p>
              </div>

              <div className="admin-home-preview-grid">
                <div className="admin-home-preview-lead">
                  <div className="admin-preview-word">PETBOX</div>
                  <strong>{form.showcaseLeadTitle}</strong>
                  <p>{form.showcaseLeadText}</p>
                </div>

                <PreviewTile box={campaignBoxes[0]} variant="promo" />
                <PreviewTile box={campaignBoxes[1]} variant="green" />
                <PreviewTile box={campaignBoxes[2]} variant="cream" />
                <PreviewTile box={campaignBoxes[3]} variant="blue" />
                <PreviewTile box={campaignBoxes[4]} variant="blog" />
              </div>
            </div>
          </div>

          <div className="col-12"><hr /></div>

          {campaignBoxes.map((box) => (
            <div className="col-xl-6" key={box.title}>
              <div className="admin-config-group h-100">
                <div className="admin-config-group-head">
                  <div><h3>{box.title}</h3><p>Texto, imagem e destino deste bloco.</p></div>
                </div>
                <div className="row g-3">
                  <div className="col-md-5"><label className="form-label fw-bold">Etiqueta</label><input className="admin-form-control" value={String(form[box.label] || "")} onChange={(event) => update(box.label, event.target.value)} /></div>
                  <div className="col-md-7"><label className="form-label fw-bold">Titulo</label><input className="admin-form-control" value={String(form[box.heading] || "")} onChange={(event) => update(box.heading, event.target.value)} /></div>
                  <div className="col-12"><label className="form-label fw-bold">Texto</label><textarea className="admin-form-control" rows={2} value={String(form[box.text] || "")} onChange={(event) => update(box.text, event.target.value)} /></div>
                  <div className="col-md-5"><label className="form-label fw-bold">Botao</label><input className="admin-form-control" value={String(form[box.cta] || "")} onChange={(event) => update(box.cta, event.target.value)} /></div>
                  <div className="col-md-7"><label className="form-label fw-bold">Link</label><input className="admin-form-control" value={String(form[box.href] || "")} onChange={(event) => update(box.href, event.target.value)} /></div>
                  <div className="col-12"><label className="form-label fw-bold">Imagem</label><ImageControls field={box.image} /></div>
                </div>
              </div>
            </div>
          ))}

          <div className="col-12"><hr /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Titulo dos planos</label><input className="admin-form-control mb-2" value={form.plansEyebrow} onChange={(event) => update("plansEyebrow", event.target.value)} /><input className="admin-form-control" value={form.plansTitle} onChange={(event) => update("plansTitle", event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label fw-bold">Titulo dos produtos</label><input className="admin-form-control mb-2" value={form.productsEyebrow} onChange={(event) => update("productsEyebrow", event.target.value)} /><input className="admin-form-control" value={form.productsTitle} onChange={(event) => update("productsTitle", event.target.value)} /></div>
        </div>
        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>
    </div>
  );
}
