import { LegalPage } from "@/components/LegalPage";
import { loadLegalPage } from "@/lib/legal-db";

export const metadata = {
  title: "Termos e Condicoes | PetBox",
  description: "Termos de utilizacao e compra da loja PetBox."
};

export default async function TermsPage() {
  const page = await loadLegalPage("termos");
  return <LegalPage title={page.title} intro={page.intro} sections={page.sections} />;
}
