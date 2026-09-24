import type { MetadataRoute } from "next";
import { config, isProductionSite } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/checkout/",
          "/cart/",
          "/account/",
          "/diagnostico-api/",
          "/minha-conta/",
          "/*?add-to-cart=",
          "/*?*add-to-cart=",
        ],
      },
    ],
    sitemap: `${config.siteUrl}/sitemap.xml`,
    host: config.siteUrl,
  };
}
