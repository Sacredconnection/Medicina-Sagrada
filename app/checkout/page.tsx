import { redirect } from "next/navigation";

// A GET must never start a checkout: Next.js and browsers can prefetch links.
export default function CheckoutPage() { redirect("/cart/"); }
