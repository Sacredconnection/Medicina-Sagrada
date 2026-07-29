import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Medicina Sagrada",
    short_name: "Medicina Sagrada",
    description:
      "Medicinas, arte e cultura dos povos indígenas e tradicionais do Brasil.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2e9",
    theme_color: "#173f31",
    lang: "pt-BR",
  };
}
