export type RenderedText = {
  rendered: string;
  protected?: boolean;
};

export type WordPressMedia = {
  source_url?: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
  };
};

export type WordPressContent = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  type: "page" | "post";
  title: RenderedText;
  content: RenderedText;
  excerpt: RenderedText;
  featured_media?: number;
  _embedded?: {
    "wp:featuredmedia"?: WordPressMedia[];
  };
};

export type WooImage = {
  id: number;
  src: string;
  thumbnail?: string;
  srcset?: string;
  sizes?: string;
  name?: string;
  alt?: string;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: WooImage | null;
  permalink: string;
};

export type WooPrices = {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range: {
    min_amount: string;
    max_amount: string;
  } | null;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku: string;
  type: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WooPrices;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: WooImage[];
  categories: Array<Pick<WooCategory, "id" | "name" | "slug">>;
  is_purchasable?: boolean;
  is_in_stock?: boolean;
  add_to_cart?: {
    text: string;
    description: string;
    url: string;
  };
};
