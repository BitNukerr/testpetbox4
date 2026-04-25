import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "PetBox - Caixa de Subscrição para Animais",
  description: "Caixas mensais e trimestrais para cães e gatos com brinquedos, snacks e acessórios personalizados.",
  keywords: ["caixa para animais", "subscrição para cães", "subscrição para gatos", "PetBox"]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT"><body><Header /><main>{children}</main><Footer /></body></html>
  );
}
