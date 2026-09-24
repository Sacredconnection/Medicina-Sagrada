import { wooCollection } from "@/lib/api";
import { plainText } from "@/lib/html";

type WooReview = { id: number; product_id: number; reviewer: string; review: string; rating: number; verified: boolean; date_created_gmt: string };
export async function getReviews(productId: number, page = 1) {
  const result = await wooCollection<WooReview>("products/reviews", { product_id: productId, per_page: 5, page, orderby: "date_gmt", order: "desc" }, ["woocommerce", `reviews:${productId}`]);
  return { ...result, data: result.data.map(review => ({ id: review.id, reviewer: plainText(review.reviewer), review: plainText(review.review), rating: review.rating, verified: review.verified, date: review.date_created_gmt })) };
}
export type ProductReview = Awaited<ReturnType<typeof getReviews>>["data"][number];
