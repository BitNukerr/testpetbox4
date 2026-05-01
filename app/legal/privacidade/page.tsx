import { LegalPage } from "@/components/LegalPage";
import { loadLegalPage } from "@/lib/legal-db";

export const metadata = {
  title: "Politica de Privacidade | PetBox",
  description: "Como a PetBox recolhe, usa e protege dados pessoais."
};

export default async function PrivacyPage() {
  const page = await loadLegalPage("privacidade");
  return <LegalPage title={page.title} intro={page.intro} sections={page.sections} />;
}
