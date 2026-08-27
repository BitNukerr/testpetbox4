import SmartImage from "@/components/SmartImage";

export default function SobrePage() {
  return (
    <section className="container section narrow">
      <span className="eyebrow">Sobre</span>
      <h1>Criada para momentos surpresa mais felizes</h1>
      <p>
        A PetBox é uma loja online para caixas mistério para cães e gatos. Junta planos mensais e trimestrais,
        personalização por perfil do animal, produtos avulsos e pagamento por MB WAY via Easypay.
      </p>
      <SmartImage src="/images/about-pets.svg" alt="Ilustração de cães e gatos" className="wide-image" width={1100} height={700} sizes="(max-width: 900px) 100vw, 760px" priority />
    </section>
  );
}
