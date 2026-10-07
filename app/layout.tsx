import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CartProvider } from "@/components/cart-provider";
import { AdobeFontsStylesheet } from "@/components/adobe-fonts-stylesheet";
import { JsonLd } from "@/components/json-ld";
import { config, isProductionSite } from "@/lib/config";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  ...(!isProductionSite ? { robots: { index: false, follow: false } } : {}),
  title: {
    default: "Medicina Sagrada",
    template: "%s | Medicina Sagrada",
  },
  description:
    "Medicinas, arte e cultura dos povos indígenas e tradicionais do Brasil.",
  applicationName: "Medicina Sagrada",
  category: "shopping",
  creator: "Medicina Sagrada",
  publisher: "Medicina Sagrada",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173f31",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" />
      </head>
      <body id="top">
        <AdobeFontsStylesheet />
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <CartProvider checkoutUrl={config.wooCheckoutUrl}>
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
        </CartProvider>
        <JsonLd data={[organizationSchema, websiteSchema]} />
      </body>
    </html>
  );
}
