"use client";

import { useEffect, useState } from "react";
import { AdminImageField, AdminImageListField } from "@/components/AdminImageField";
import { loadRemoteHomeSettingsForAdmin, saveRemoteHomeSettings } from "@/lib/admin-db";
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

function sameHomeSettings(left: HomeSettings, right: HomeSettings) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export default function AdminHomeClient() {
  const [form, setForm] = useState<HomeSettings>(() => adminStore.home.get());
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishedSettings, setPublishedSettings] = useState<HomeSettings | null>(null);

  useEffect(() => {
    const localSettings = adminStore.home.get();
    const hasLocalSettings = adminStore.home.hasLocal();

    loadRemoteHomeSettingsForAdmin(localSettings)
      .then((settings) => {
        if (hasLocalSettings && !sameHomeSettings(localSettings, settings)) {
          setForm(localSettings);
          setPublishedSettings(settings);
          setMessage("Este browser tem alteracoes locais diferentes da versao publicada. Clique em Guardar para publicar estas imagens e textos para todos os visitantes.");
          return;
        }

        setForm(settings);
        adminStore.home.set(settings);
        setPublishedSettings(null);
      })
      .catch(() => {
        if (hasLocalSettings) {
          setMessage("Nao consegui carregar a versao publicada. Pode continuar a editar este rascunho local e tentar Guardar novamente.");
        }
      });
  }, []);

  function update(field: FieldName, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      await saveRemoteHomeSettings(form);
      adminStore.home.set(form);
      setPublishedSettings(null);
      setMessage("Pagina inicial publicada. Novos visitantes vao ver estas imagens e textos.");
    } catch {
      adminStore.home.set(form);
      setMessage("Nao consegui guardar no Supabase. Estas alteracoes ficaram so neste browser; novos visitantes continuam a ver a versao antiga.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    adminStore.home.reset();
    setForm(adminStore.home.get());
    setPublishedSettings(null);
    setMessage("Pagina inicial reposta.");
  }

  function usePublishedVersion() {
    if (!publishedSettings) return;
    setForm(publishedSettings);
    adminStore.home.set(publishedSettings);
    setPublishedSettings(null);
    setMessage("Versao publicada carregada neste editor.");
  }

  function previewAsCustomer() {
    adminStore.home.set(form);
    window.open("/?preview=admin", "_blank", "noopener,noreferrer");
    setMessage("Pre-visualizacao aberta com este rascunho local. Para publicar para todos, clique em Guardar.");
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
          {publishedSettings ? <button className="admin-action-btn" onClick={usePublishedVersion}>Usar publicada</button> : null}
          <button className="admin-action-btn" onClick={previewAsCustomer}>Pre-visualizar site</button>
          <button className="admin-action-btn admin-action-primary" onClick={save} disabled={saving}>{saving ? "A guardar..." : "Guardar"}</button>
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
                <div className="admin-home-preview-info">
                  <span>{form.infoLabel}</span>
                  <strong>{form.infoTitle}</strong>
                  <p>{form.infoText}</p>
                  <div>
                    <small>{form.infoStepOneTitle}</small>
                    <small>{form.infoStepTwoTitle}</small>
                    <small>{form.infoStepThreeTitle}</small>
                  </div>
                </div>
                <div className="admin-home-preview-trust">
                  <span>{form.trustLabel}</span>
                  <strong>{form.trustTitle}</strong>
                  <p>{form.salesBannerText}</p>
                  <small>{form.faqOneQuestion}</small>
                  <small>{form.faqTwoQuestion}</small>
                  <small>{form.faqThreeQuestion}</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12"><hr /></div>

          <div className="col-12">
            <div className="admin-config-group">
              <div className="admin-config-group-head">
                <div><h3>Bloco Como funciona</h3><p>Texto da caixa informativa que explica o objectivo do site e o processo de compra.</p></div>
              </div>
              <div className="row g-3">
                <div className="col-md-4"><label className="form-label fw-bold">Etiqueta</label><input className="admin-form-control" value={form.infoLabel} onChange={(event) => update("infoLabel", event.target.value)} /></div>
                <div className="col-md-8"><label className="form-label fw-bold">Titulo</label><input className="admin-form-control" value={form.infoTitle} onChange={(event) => update("infoTitle", event.target.value)} /></div>
                <div className="col-12"><label className="form-label fw-bold">Texto principal</label><textarea className="admin-form-control" rows={3} value={form.infoText} onChange={(event) => update("infoText", event.target.value)} /></div>
                <div className="col-md-4"><label className="form-label fw-bold">Passo 1</label><input className="admin-form-control mb-2" value={form.infoStepOneTitle} onChange={(event) => update("infoStepOneTitle", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.infoStepOneText} onChange={(event) => update("infoStepOneText", event.target.value)} /></div>
                <div className="col-md-4"><label className="form-label fw-bold">Passo 2</label><input className="admin-form-control mb-2" value={form.infoStepTwoTitle} onChange={(event) => update("infoStepTwoTitle", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.infoStepTwoText} onChange={(event) => update("infoStepTwoText", event.target.value)} /></div>
                <div className="col-md-4"><label className="form-label fw-bold">Passo 3</label><input className="admin-form-control mb-2" value={form.infoStepThreeTitle} onChange={(event) => update("infoStepThreeTitle", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.infoStepThreeText} onChange={(event) => update("infoStepThreeText", event.target.value)} /></div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="admin-config-group">
              <div className="admin-config-group-head">
                <div><h3>Confiança, reviews e FAQ</h3><p>Conteudo de apoio a conversao: banner, provas de confiança e perguntas frequentes.</p></div>
              </div>
              <div className="row g-3">
                <div className="col-md-7"><label className="form-label fw-bold">Texto do banner</label><input className="admin-form-control" value={form.salesBannerText} onChange={(event) => update("salesBannerText", event.target.value)} /></div>
                <div className="col-md-2"><label className="form-label fw-bold">Botao</label><input className="admin-form-control" value={form.salesBannerCta} onChange={(event) => update("salesBannerCta", event.target.value)} /></div>
                <div className="col-md-3"><label className="form-label fw-bold">Link</label><input className="admin-form-control" value={form.salesBannerHref} onChange={(event) => update("salesBannerHref", event.target.value)} /></div>

                <div className="col-md-4"><label className="form-label fw-bold">Etiqueta</label><input className="admin-form-control" value={form.trustLabel} onChange={(event) => update("trustLabel", event.target.value)} /></div>
                <div className="col-md-8"><label className="form-label fw-bold">Titulo de confiança</label><input className="admin-form-control" value={form.trustTitle} onChange={(event) => update("trustTitle", event.target.value)} /></div>
                <div className="col-12"><label className="form-label fw-bold">Texto de confiança</label><textarea className="admin-form-control" rows={2} value={form.trustText} onChange={(event) => update("trustText", event.target.value)} /></div>

                <div className="col-md-4"><label className="form-label fw-bold">Ponto 1</label><input className="admin-form-control mb-2" value={form.trustOneTitle} onChange={(event) => update("trustOneTitle", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.trustOneText} onChange={(event) => update("trustOneText", event.target.value)} /></div>
                <div className="col-md-4"><label className="form-label fw-bold">Ponto 2</label><input className="admin-form-control mb-2" value={form.trustTwoTitle} onChange={(event) => update("trustTwoTitle", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.trustTwoText} onChange={(event) => update("trustTwoText", event.target.value)} /></div>
                <div className="col-md-4"><label className="form-label fw-bold">Ponto 3</label><input className="admin-form-control mb-2" value={form.trustThreeTitle} onChange={(event) => update("trustThreeTitle", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.trustThreeText} onChange={(event) => update("trustThreeText", event.target.value)} /></div>

                <div className="col-md-6"><label className="form-label fw-bold">Review 1</label><textarea className="admin-form-control mb-2" rows={3} value={form.reviewOneQuote} onChange={(event) => update("reviewOneQuote", event.target.value)} /><input className="admin-form-control" value={form.reviewOneAuthor} onChange={(event) => update("reviewOneAuthor", event.target.value)} /></div>
                <div className="col-md-6"><label className="form-label fw-bold">Review 2</label><textarea className="admin-form-control mb-2" rows={3} value={form.reviewTwoQuote} onChange={(event) => update("reviewTwoQuote", event.target.value)} /><input className="admin-form-control" value={form.reviewTwoAuthor} onChange={(event) => update("reviewTwoAuthor", event.target.value)} /></div>

                <div className="col-md-4"><label className="form-label fw-bold">FAQ 1</label><input className="admin-form-control mb-2" value={form.faqOneQuestion} onChange={(event) => update("faqOneQuestion", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.faqOneAnswer} onChange={(event) => update("faqOneAnswer", event.target.value)} /></div>
                <div className="col-md-4"><label className="form-label fw-bold">FAQ 2</label><input className="admin-form-control mb-2" value={form.faqTwoQuestion} onChange={(event) => update("faqTwoQuestion", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.faqTwoAnswer} onChange={(event) => update("faqTwoAnswer", event.target.value)} /></div>
                <div className="col-md-4"><label className="form-label fw-bold">FAQ 3</label><input className="admin-form-control mb-2" value={form.faqThreeQuestion} onChange={(event) => update("faqThreeQuestion", event.target.value)} /><textarea className="admin-form-control" rows={3} value={form.faqThreeAnswer} onChange={(event) => update("faqThreeAnswer", event.target.value)} /></div>
              </div>
            </div>
          </div>

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
