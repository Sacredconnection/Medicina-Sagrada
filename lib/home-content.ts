import type { WooProduct } from "@/lib/types";
import { plainText } from "@/lib/html";

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
    accessoriesDesktopImage: "/assets/home/hero/medicina-sagrada-home-hero-02-desktop.webp",
    accessoriesMobileImage: "/assets/home/hero/medicina-sagrada-home-hero-02-mobile.webp",
    alt: "Latas de rapé e colar sobre madeira diante da floresta amazônica",
  },
  story: {
    image:
      "https://medicinasagrada.com.br/wp-content/uploads/2024/04/institucional-medicinaB-jpg.webp",
    alt: "Detalhe de uma paisagem da floresta",
  },
  categories: {
    rape: "/assets/home/categories/medicina-sagrada-categoria-rape.webp",
    sananga: "/assets/home/categories/medicina-sagrada-categoria-sananga.webp",
    incense: "/assets/home/categories/medicina-sagrada-categoria-incensos.webp",
    accessories: "/assets/home/categories/medicina-sagrada-categoria-acessorios.webp",
    craft: "/assets/home/categories/medicina-sagrada-categoria-artesanato.webp",
  },
  editorial: {
    sananga:
      "https://medicinasagrada.com.br/wp-content/uploads/2026/01/medicina_jan26_BannerQuadrado_Sananga1.webp",
    kuripe:
      "https://medicinasagrada.com.br/wp-content/uploads/2026/01/medicina_jan26_BannerQuadrado_KuripeSennae.webp",
    incense:
      "https://medicinasagrada.com.br/wp-content/uploads/2026/01/medicina_jan26_BannerQuadrado_BreuBranco.webp",
  },
  kits: {
    fourElements: "/assets/home/kits/medicina-sagrada-kit-4-elementos.webp",
    tenTribes: "/assets/home/kits/medicina-sagrada-kit-10-tribos.webp",
    amazonianStrength:
      "/assets/home/kits/medicina-sagrada-kit-forca-amazonica.webp",
  },
} as const;

export const homeCategories = [
  {
    href: "/product-category/rape/",
    name: "Rapé",
    detail: "Medicinas de diferentes etnias da Amazônia.",
    image: homeAssets.categories.rape,
  },
  {
    href: "/product-category/medicinais/sananga-medicinais/",
    name: "Sananga",
    detail: "Limpeza profunda para clareza e intuição.",
    image: homeAssets.categories.sananga,
  },
  {
    href: "/product-category/incensos/",
    name: "Incensos",
    detail: "Purificação natural para elevar a energia do ambiente.",
    image: homeAssets.categories.incense,
  },
  {
    href: "/product-category/acessorios/",
    name: "Acessórios",
    detail: "Conecte-se às raízes através da arte e da tradição.",
    image: homeAssets.categories.accessories,
  },
  {
    href: "/product-category/artesanato/",
    name: "Artesanato",
    detail: "A força da ancestralidade em cada detalhe.",
    image: homeAssets.categories.craft,
  },
] as const;

export type HomeKitBanner = {
  key: string;
  href: string;
  title: string;
  label: string;
  image: string;
  fallbackImage: string;
};

export const kitBanners: HomeKitBanner[] = [
  {
    key: "kit-4-elementos",
    href: "/product/kit-4-elementos/",
    title: "Kit 4 Elementos",
    label: "Conhecer o kit",
    image: homeAssets.kits.fourElements,
    fallbackImage:
      "https://medicinasagrada.com.br/wp-content/uploads/2025/01/4-Elementos-3.jpg",
  },
  {
    key: "kit-10-tribos-10-x-10g",
    href: "/product/kit-10-tribos-10-x-10g/",
    title: "Kit 10 Tribos",
    label: "Conhecer o kit",
    image: homeAssets.kits.tenTribes,
    fallbackImage:
      "https://medicinasagrada.com.br/wp-content/uploads/2023/05/10tribes1.webp",
  },
  {
    key: "kit-forca-amazonica",
    href: "/product/kit-forca-amazonica/",
    title: "Kit Força Amazônica",
    label: "Conhecer o kit",
    image: homeAssets.kits.amazonianStrength,
    fallbackImage:
      "https://medicinasagrada.com.br/wp-content/uploads/2022/07/forcaamazonica.webp",
  },
];

export const getHomeKitBanners = (products: WooProduct[]) => {
  const curatedByHref = new Map(
    kitBanners.map((banner) => [banner.href, banner] as const),
  );

  const productBanners = products
    .filter(
      (product) =>
        product.categories.some((category) => category.slug === "kits") &&
        product.is_in_stock !== false &&
        Boolean(product.images[0]?.src),
    )
    .map<HomeKitBanner>((product) => {
      const href = `/product/${product.slug}/`;
      const curated = curatedByHref.get(href);
      const productImage = product.images[0]?.src ?? "";

      return {
        key: String(product.id),
        href,
        title: plainText(product.name),
        label: "Conhecer o kit",
        image: curated?.image ?? productImage,
        fallbackImage: productImage || curated?.fallbackImage || curated?.image || "",
      };
    });

  const productHrefs = new Set(productBanners.map(({ href }) => href));

  return [
    ...productBanners,
    ...kitBanners.filter(({ href }) => !productHrefs.has(href)),
  ];
};

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
