import Configurator from "@/components/Configurator";
import { getCachedConfiguratorData } from "@/lib/site-data";

export const revalidate = 300;

export default async function CriarCaixaPage() {
  const configuratorData = await getCachedConfiguratorData();

  return (
    <section className="container section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Configurador</span>
          <h1>Crie a caixa ideal para o seu animal</h1>
          <p className="muted">Escolha o animal, plano, personalidade e extras. O resumo actualiza automaticamente.</p>
        </div>
      </div>
      <Configurator {...configuratorData} />
    </section>
  );
}
