import type { WooImage, WooPrices } from "./types";

export type CartItem = {
  key: string;
  id: number;
  quantity: number;
  name: string;
  permalink: string;
  images: WooImage[];
  variation: Array<{ attribute: string; value: string }>;
  quantity_limits: { minimum: number; maximum: number; multiple_of: number; editable: boolean };
  prices: WooPrices;
  totals: { line_total: string; line_subtotal: string; currency_code: string; currency_minor_unit: number };
};

export type WooCart = {
  items: CartItem[];
  items_count: number;
  coupons: Array<{ code: string; discount_type: string }>;
  totals: {
    total_items: string;
    total_discount: string;
    total_price: string;
    total_shipping: string | null;
    total_tax: string;
    currency_code: string;
    currency_minor_unit: number;
  };
  needs_shipping: boolean;
  has_calculated_shipping: boolean;
  errors: Array<{ code: string; message: string }>;
  payment_methods: string[];
};

export const formatMoney = (amount: string, currency = "BRL", minorUnit = 2) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number(amount) / 10 ** minorUnit);
