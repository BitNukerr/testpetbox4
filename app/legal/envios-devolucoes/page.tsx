import { LegalPage } from "@/components/LegalPage";
import { loadLegalPage } from "@/lib/legal-db";

export const metadata = {
  title: "Envios e Devolucoes | PetBox",
  description: "Informacao sobre entregas, devolucoes, reembolsos e direito de livre resolucao."
};

export default async function ShippingReturnsPage() {
  const page = await loadLegalPage("envios-devolucoes");
  return <LegalPage title={page.title} intro={page.intro} sections={page.sections} />;
}
