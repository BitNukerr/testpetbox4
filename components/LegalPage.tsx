import Link from "next/link";

type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <section className="section legal-page">
      <div className="container narrow">
        <span className="eyebrow">Informacao legal</span>
        <h1>{title}</h1>
        <p className="muted">{intro}</p>
        <div className="legal-note">
          Estes textos sao uma base operacional para a PetBox. Antes de lancar a loja em producao, confirme os dados finais da entidade, NIF, morada fiscal e politica comercial com apoio profissional.
        </div>
        <div className="legal-sections">
          {sections.map((section) => (
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
