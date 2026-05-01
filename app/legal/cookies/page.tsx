import { LegalPage } from "@/components/LegalPage";
import { loadLegalPage } from "@/lib/legal-db";

export const metadata = {
  title: "Politica de Cookies | PetBox",
  description: "Informacao sobre cookies e tecnologias semelhantes usadas pela PetBox."
};

export default async function CookiesPage() {
  const page = await loadLegalPage("cookies");
  return <LegalPage title={page.title} intro={page.intro} sections={page.sections} />;
}
