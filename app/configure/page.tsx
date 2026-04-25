import Configurator from "@/components/Configurator";

export default function ConfigurePage() {
  return (
    <section className="container section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Configurador</span>
          <h1>Crie a caixa ideal para o seu animal</h1>
        </div>
      </div>
      <Configurator />
    </section>
  );
}
