import { pt } from "@/lib/translations";

export default function AboutPage() {
  return (
    <section className="container section narrow">
      <span className="eyebrow">{pt.pages.aboutEyebrow}</span>
      <h1>{pt.pages.aboutTitle}</h1>
      <p>{pt.pages.aboutText}</p>
      <div className="detail-box"><strong>Proposta de valor:</strong> conveniência, personalização e descoberta de produtos para animais de estimação.</div>
      <img src="/images/about-pets.svg" alt="Ilustração de cão e gato" className="wide-image" />
    </section>
  );
}
