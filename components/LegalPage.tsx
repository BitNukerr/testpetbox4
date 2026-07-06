"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminStore } from "@/lib/admin-store";
import type { LegalPageKey, LegalSection } from "@/lib/legal-content";

export function LegalPage({ pageKey, title, intro, sections }: { pageKey?: LegalPageKey; title: string; intro: string; sections: LegalSection[] }) {
  const [content, setContent] = useState({ title, intro, sections });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!pageKey || new URLSearchParams(window.location.search).get("preview") !== "admin") return;
    const refresh = () => {
      const page = adminStore.legal.get()[pageKey];
      setContent({ title: page.title, intro: page.intro, sections: page.sections });
    };
    setPreviewMode(true);
    refresh();
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, [pageKey]);

  return (
    <section className="section legal-page">
      <div className="container narrow">
        {previewMode ? <div className="preview-mode-banner">Pre-visualizacao local do admin. Os visitantes so veem isto depois de guardar.</div> : null}
        <span className="eyebrow">Informacao legal</span>
        <h1>{content.title}</h1>
        <p className="muted">{content.intro}</p>
        <div className="legal-note">
          Estes textos sao uma base operacional para a PetBox. Antes de lancar a loja em producao, confirme os dados finais da entidade, NIF, morada fiscal e politica comercial com apoio profissional.
        </div>
        <div className="legal-sections">
          {content.sections.map((section) => (
            <article key={section.title} className="card">
              <div className="card-body">
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>
          ))}
        </div>
        <div className="legal-links">
          <Link href="/legal/termos">Termos</Link>
          <Link href="/legal/privacidade">Privacidade</Link>
          <Link href="/legal/envios-devolucoes">Envios e devolucoes</Link>
          <Link href="/legal/cookies">Cookies</Link>
        </div>
      </div>
    </section>
  );
}
