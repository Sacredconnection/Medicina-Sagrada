import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { config } from "@/lib/config";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
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
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
        <JsonLd data={[organizationSchema, websiteSchema]} />
      </body>
    </html>
  );
}
