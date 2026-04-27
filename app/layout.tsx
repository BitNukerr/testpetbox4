import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
  title: "PetBox - Caixas de subscricao para caes e gatos",
  description: "Caixas mensais e trimestrais para caes e gatos com brinquedos, snacks e acessorios personalizados em Portugal.",
  keywords: ["PetBox", "caixa subscricao caes", "caixa subscricao gatos", "produtos para animais Portugal", "MB WAY pets"],
  openGraph: {
    title: "PetBox - Caixas de subscricao para caes e gatos",
    description: "Brinquedos, snacks e acessorios escolhidos para o perfil do seu animal.",
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
        <Analytics />
      </body>
    </html>
  );
}
