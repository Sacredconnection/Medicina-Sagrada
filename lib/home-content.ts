import type { WooProduct } from "@/lib/types";

/**
 * Conteúdo visual da home.
 *
 * As imagens estão centralizadas aqui para que a troca de materiais futuros
 * aconteça sem alterar a estrutura dos componentes. Quando os novos arquivos
 * forem aprovados, substitua apenas as URLs deste arquivo.
 */
export const homeAssets = {
  hero: {
    desktopImage: "/assets/home/hero/medicina-sagrada-home-hero-desktop.webp",
    mobileImage: "/assets/home/hero/medicina-sagrada-home-hero-mobile.webp",
    alt: "Latas de rapé e colar sobre madeira diante da floresta amazônica",
  },
  story: {
    image:
      "https://medicinasagrada.com.br/wp-content/uploads/2024/04/institucional-medicinaB-jpg.webp",
    alt: "Detalhe de uma paisagem da floresta",
  },
  categories: {
    rape: "https://medicinasagrada.com.br/wp-content/uploads/2024/04/Rapes.png",
    sananga:
      "https://medicinasagrada.com.br/wp-content/uploads/2024/04/Sananga.png",
    incense:
      "https://medicinasagrada.com.br/wp-content/uploads/2024/04/Incensos.png",
    accessories:
      "https://medicinasagrada.com.br/wp-content/uploads/2024/04/Artesanato.png",
    craft:
      "https://medicinasagrada.com.br/wp-content/uploads/2024/04/Artesanato.png",
  },
  editorial: {
    sananga:
      "https://medicinasagrada.com.br/wp-content/uploads/2026/01/medicina_jan26_BannerQuadrado_Sananga1.webp",
    kuripe:
      "https://medicinasagrada.com.br/wp-content/uploads/2026/01/medicina_jan26_BannerQuadrado_KuripeSennae.webp",
    incense:
      "https://medicinasagrada.com.br/wp-content/uploads/2026/01/medicina_jan26_BannerQuadrado_BreuBranco.webp",
  },
} as const;

export const homeCategories = [
  {
    href: "/product-category/rape/",
    name: "Rapé",
    detail: "Medicinas de diferentes povos e linhagens",
    image: homeAssets.categories.rape,
  },
  {
    href: "/product-category/sananga/",
    name: "Sananga",
    detail: "Presença, cuidado e conhecimento tradicional",
    image: homeAssets.categories.sananga,
  },
  {
    href: "/product-category/incensos/",
    name: "Incensos",
    detail: "Aromas naturais para criar seus momentos",
    image: homeAssets.categories.incense,
  },
  {
    href: "/product-category/acessorios/",
    name: "Acessórios",
    detail: "Instrumentos para acompanhar a prática",
    image: homeAssets.categories.accessories,
  },
  {
    href: "/product-category/artesanato/",
    name: "Artesanato",
    detail: "Arte, memória e expressão dos povos",
    image: homeAssets.categories.craft,
  },
] as const;

export const editorialBanners = [
  {
    href: "/product-category/sananga/",
    eyebrow: "Cuidado e presença",
    title: "Um caminho de atenção para o agora.",
    label: "Conheça Sananga",
    image: homeAssets.editorial.sananga,
    tone: "light",
  },
  {
    href: "/product-category/acessorios/",
    eyebrow: "Feito para a prática",
    title: "Objetos que acompanham o sopro.",
    label: "Ver acessórios",
    image: homeAssets.editorial.kuripe,
    tone: "dark",
  },
  {
    href: "/product-category/incensos/",
    eyebrow: "A casa como altar",
    title: "Aromas para marcar a passagem.",
    label: "Explorar incensos",
    image: homeAssets.editorial.incense,
    tone: "light",
  },
] as const;

const demoImage = (src: string, alt: string) => ({
  id: 0,
  src,
  thumbnail: src,
  alt,
  name: alt,
});

const demoPrices = (amount: string): WooProduct["prices"] => ({
  price: amount,
  regular_price: amount,
  sale_price: "",
  price_range: null,
  currency_code: "BRL",
  currency_symbol: "R$",
  currency_minor_unit: 2,
  currency_decimal_separator: ",",
  currency_thousand_separator: ".",
  currency_prefix: "R$ ",
  currency_suffix: "",
});

/** Fallback visual para a home quando a API ainda não estiver configurada. */
export const demoProducts: WooProduct[] = [
  {
    id: 1,
    name: "Rapé Yawanawa – Tsunu",
    slug: "yawanawa-tsunu",
    permalink: "/product/yawanawa-tsunu/",
    sku: "",
    type: "variable",
    short_description: "",
    description: "",
    on_sale: false,
    prices: demoPrices("2700"),
    price_html: "",
    average_rating: "5.00",
    review_count: 18,
    images: [
      demoImage(
        "https://medicinasagrada.com.br/wp-content/uploads/2019/03/FAMILIA_YAWANAWA-Tsunu-300x300.jpg",
        "Rapé Yawanawa Tsunu",
      ),
    ],
    categories: [{ id: 0, name: "Rapé", slug: "rape" }],
    is_purchasable: true,
    is_in_stock: true,
  },
  {
    id: 2,
    name: "Rapé Apurinã – Awiry",
    slug: "apurina-awiry",
    permalink: "/product/apurina-awiry/",
    sku: "",
    type: "variable",
    short_description: "",
    description: "",
    on_sale: false,
    prices: demoPrices("3000"),
    price_html: "",
    average_rating: "5.00",
    review_count: 12,
    images: [
      demoImage(
        "https://medicinasagrada.com.br/wp-content/uploads/2019/03/Familia_Apurina-300x300.webp",
        "Rapé Apurinã Awiry",
      ),
    ],
    categories: [{ id: 0, name: "Apurinã", slug: "apurina" }],
    is_purchasable: true,
    is_in_stock: true,
  },
  {
    id: 3,
    name: "Rapé Caboclo – Paricá",
    slug: "caboclo-parica",
    permalink: "/product/caboclo-parica/",
    sku: "",
    type: "variable",
    short_description: "",
    description: "",
    on_sale: false,
    prices: demoPrices("2700"),
    price_html: "",
    average_rating: "4.86",
    review_count: 9,
    images: [
      demoImage(
        "https://medicinasagrada.com.br/wp-content/uploads/2019/01/FAMILIA_CABOCLO-Parica-300x300.webp",
        "Rapé Caboclo Paricá",
      ),
    ],
    categories: [{ id: 0, name: "Caboclo", slug: "caboclo" }],
    is_purchasable: true,
    is_in_stock: true,
  },
  {
    id: 4,
    name: "Rapé Nukini – Onça",
    slug: "nukini-onca",
    permalink: "/product/nukini-onca/",
    sku: "",
    type: "variable",
    short_description: "",
    description: "",
    on_sale: false,
    prices: demoPrices("3000"),
    price_html: "",
    average_rating: "5.00",
    review_count: 11,
    images: [
      demoImage(
        "https://medicinasagrada.com.br/wp-content/uploads/2019/03/FAMILIA_NUKINI-Onca-300x300.jpg",
        "Rapé Nukini Onça",
      ),
    ],
    categories: [{ id: 0, name: "Nukini", slug: "nukini" }],
    is_purchasable: true,
    is_in_stock: true,
  },
  {
    id: 5,
    name: "Rapé Kuntanawa – Veia de Pajé",
    slug: "kuntanawa-veia-de-paje",
    permalink: "/product/kuntanawa-veia-de-paje/",
    sku: "",
    type: "variable",
    short_description: "",
    description: "",
    on_sale: false,
    prices: demoPrices("3200"),
    price_html: "",
    average_rating: "5.00",
    review_count: 8,
    images: [
      demoImage(
        "https://medicinasagrada.com.br/wp-content/uploads/2019/03/FAMILIA_KUNTANAWA-VeiaDePaje-300x300.jpg",
        "Rapé Kuntanawa Veia de Pajé",
      ),
    ],
    categories: [{ id: 0, name: "Kuntanawa", slug: "kuntanawa" }],
    is_purchasable: true,
    is_in_stock: true,
  },
  {
    id: 6,
    name: "Sananga",
    slug: "sananga-10ml",
    permalink: "/product/sananga-10ml/",
    sku: "",
    type: "simple",
    short_description: "",
    description: "",
    on_sale: false,
    prices: demoPrices("3500"),
    price_html: "",
    average_rating: "5.00",
    review_count: 15,
    images: [
      demoImage(
        "https://medicinasagrada.com.br/wp-content/uploads/2020/04/Sananga-300x300.jpg",
        "Sananga",
      ),
    ],
    categories: [{ id: 0, name: "Sananga", slug: "sananga" }],
    is_purchasable: true,
    is_in_stock: true,
  },
];
