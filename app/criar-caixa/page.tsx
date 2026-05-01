import Configurator from "@/components/Configurator";

export default function CriarCaixaPage() {
  return (
    <section className="container section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Configurador</span>
          <h1>Crie a caixa ideal para o seu animal</h1>
          <p className="muted">Escolha o animal, plano, personalidade e extras. O resumo actualiza automaticamente.</p>
        </div>
      </div>
      <Configurator />
    </section>
  );
}
