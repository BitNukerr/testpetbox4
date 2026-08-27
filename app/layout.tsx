import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
  title: "PetBox - Caixas mistério para cães e gatos",
  description: "Caixas mistério mensais e trimestrais para cães e gatos com brinquedos, snacks e acessórios personalizados em Portugal.",
  keywords: ["PetBox", "caixa mistério cães", "caixa mistério gatos", "produtos para animais Portugal", "MB WAY pets"],
  openGraph: {
    title: "PetBox - Caixas mistério para cães e gatos",
    description: "Brinquedos, snacks e acessórios escolhidos para o perfil do seu animal.",
    images: ["/images/hero-pets.svg"],
    locale: "pt_PT",
    type: "website"
  },
  icons: {
    icon: "/dog-paw.png",
    shortcut: "/dog-paw.png",
    apple: "/dog-paw.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
