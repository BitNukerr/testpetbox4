"use client";

import { useEffect, useMemo, useState } from "react";
import { loadRemoteLegalSettingsForAdmin, saveRemoteLegalSettings } from "@/lib/admin-db";
import { adminStore } from "@/lib/admin-store";
import { legalPageOrder, mergeLegalSettings, type LegalPageKey, type LegalSection, type LegalSettings } from "@/lib/legal-content";

function cloneSettings(settings: LegalSettings) {
  return mergeLegalSettings(JSON.parse(JSON.stringify(settings)));
}

function sectionCount(settings: LegalSettings) {
  return legalPageOrder.reduce((sum, key) => sum + settings[key].sections.length, 0);
}

export default function AdminLegalClient() {
  const [form, setForm] = useState<LegalSettings>(() => cloneSettings(adminStore.legal.get()));
  const [active, setActive] = useState<LegalPageKey>("termos");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRemoteLegalSettingsForAdmin(adminStore.legal.get())
      .then((settings) => {
        setForm(cloneSettings(settings));
        adminStore.legal.set(settings);
      })
      .catch(() => null);
  }, []);

  const page = form[active];
  const totals = useMemo(() => ({
    pages: legalPageOrder.length,
    sections: sectionCount(form)
  }), [form]);

  function updatePage(field: "label" | "title" | "intro", value: string) {
    setForm((current) => ({
      ...current,
      [active]: {
        ...current[active],
        [field]: value
      }
    }));
  }

  function updateSection(index: number, patch: Partial<LegalSection>) {
    setForm((current) => ({
      ...current,
      [active]: {
        ...current[active],
        sections: current[active].sections.map((section, sectionIndex) => (
          sectionIndex === index ? { ...section, ...patch } : section
        ))
      }
    }));
  }

  function updateParagraph(sectionIndex: number, paragraphIndex: number, value: string) {
    setForm((current) => ({
      ...current,
      [active]: {
        ...current[active],
        sections: current[active].sections.map((section, index) => {
          if (index !== sectionIndex) return section;
          return {
            ...section,
            body: section.body.map((paragraph, bodyIndex) => bodyIndex === paragraphIndex ? value : paragraph)
          };
        })
      }
    }));
  }

  function addSection() {
    setForm((current) => ({
      ...current,
      [active]: {
        ...current[active],
        sections: [
          ...current[active].sections,
          { title: "Nova seccao", body: ["Novo paragrafo."] }
        ]
      }
    }));
  }

  function removeSection(sectionIndex: number) {
    setForm((current) => ({
      ...current,
      [active]: {
        ...current[active],
        sections: current[active].sections.filter((_, index) => index !== sectionIndex)
      }
    }));
  }

  function addParagraph(sectionIndex: number) {
    setForm((current) => ({
      ...current,
      [active]: {
        ...current[active],
        sections: current[active].sections.map((section, index) => (
          index === sectionIndex ? { ...section, body: [...section.body, "Novo paragrafo."] } : section
        ))
      }
    }));
  }

  function removeParagraph(sectionIndex: number, paragraphIndex: number) {
    setForm((current) => ({
      ...current,
      [active]: {
        ...current[active],
        sections: current[active].sections.map((section, index) => {
          if (index !== sectionIndex) return section;
          const nextBody = section.body.filter((_, bodyIndex) => bodyIndex !== paragraphIndex);
          return { ...section, body: nextBody.length ? nextBody : [""] };
        })
      }
    }));
  }

  async function save() {
    const next = cloneSettings(form);
    let remoteSaved = true;
    try {
      await saveRemoteLegalSettings(next);
    } catch {
      remoteSaved = false;
    }
    adminStore.legal.set(next);
    setForm(next);
    setMessage(remoteSaved ? "Paginas legais actualizadas." : "Paginas guardadas localmente. Confirme que a tabela legal_settings existe no Supabase.");
  }

  function reset() {
    adminStore.legal.reset();
    setForm(cloneSettings(adminStore.legal.get()));
    setMessage("Paginas legais repostas localmente.");
  }

  return (
    <div className="admin-card">
      <div className="card-header admin-save-header d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <h2 className="h4 mb-1">Paginas legais</h2>
          <div className="text-muted">Edite textos de cookies, termos, privacidade, envios e devolucoes.</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="admin-action-btn admin-action-primary" onClick={save}>Guardar</button>
          <button className="admin-action-btn" onClick={reset}>Repor</button>
        </div>
      </div>

      <div className="card-body">
        <div className="admin-legal-tabs" role="tablist" aria-label="Paginas legais">
          {legalPageOrder.map((key) => (
            <button
              key={key}
              className={active === key ? "active" : ""}
              type="button"
              onClick={() => setActive(key)}
            >
              {form[key].label}
            </button>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-xl-7">
            <div className="admin-config-group mb-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Nome no admin</label>
                  <input className="admin-form-control" value={page.label} onChange={(event) => updatePage("label", event.target.value)} />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-bold">Titulo da pagina</label>
                  <input className="admin-form-control" value={page.title} onChange={(event) => updatePage("title", event.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Introducao</label>
                  <textarea className="admin-form-control" rows={3} value={page.intro} onChange={(event) => updatePage("intro", event.target.value)} />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
              <div>
                <h3 className="h5 mb-1">Seccoes</h3>
                <div className="text-muted small">Cada seccao aparece como um bloco na pagina publica.</div>
              </div>
              <button className="admin-action-btn" onClick={addSection}>Nova seccao</button>
            </div>

            <div className="admin-legal-editor">
              {page.sections.map((section, sectionIndex) => (
                <div className="admin-legal-section-editor" key={`${active}-${sectionIndex}`}>
                  <div className="admin-config-group-head">
                    <div>
                      <h3>Seccao {sectionIndex + 1}</h3>
                      <p>{section.body.length} paragrafo{section.body.length === 1 ? "" : "s"}</p>
                    </div>
                    <button className="admin-action-btn" onClick={() => removeSection(sectionIndex)}>Remover</button>
                  </div>
                  <label className="form-label fw-bold">Titulo</label>
                  <input className="admin-form-control mb-3" value={section.title} onChange={(event) => updateSection(sectionIndex, { title: event.target.value })} />
                  <div className="d-grid gap-2">
                    {section.body.map((paragraph, paragraphIndex) => (
                      <div className="admin-paragraph-row" key={`${sectionIndex}-${paragraphIndex}`}>
                        <textarea className="admin-form-control" rows={3} value={paragraph} onChange={(event) => updateParagraph(sectionIndex, paragraphIndex, event.target.value)} />
                        <button className="admin-action-btn" onClick={() => removeParagraph(sectionIndex, paragraphIndex)} aria-label="Remover paragrafo">X</button>
                      </div>
                    ))}
                  </div>
                  <button className="admin-action-btn mt-3" onClick={() => addParagraph(sectionIndex)}>Adicionar paragrafo</button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-xl-5">
            <div className="admin-legal-preview">
              <div className="admin-home-preview-head">
                <span className="eyebrow">Pre-visualizacao</span>
                <h2>{page.title || "Titulo da pagina"}</h2>
                <p>{page.intro || "Introducao da pagina legal."}</p>
              </div>
              <div className="admin-mini-stat-grid">
                <div className="admin-mini-stat"><span>Paginas</span><strong>{totals.pages}</strong></div>
                <div className="admin-mini-stat"><span>Seccoes</span><strong>{totals.sections}</strong></div>
              </div>
              <div className="admin-legal-preview-sections">
                {page.sections.map((section, index) => (
                  <article key={`${section.title}-${index}`}>
                    <h3>{section.title || "Titulo da seccao"}</h3>
                    {section.body.filter(Boolean).slice(0, 3).map((paragraph, paragraphIndex) => <p key={`${paragraphIndex}-${paragraph.slice(0, 12)}`}>{paragraph}</p>)}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        {message ? <p className="text-muted mt-3 mb-0">{message}</p> : null}
      </div>
    </div>
  );
}
