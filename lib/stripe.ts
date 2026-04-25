import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(secretKey || "sk_test_placeholder", {
  // The installed Stripe SDK predates the typed constant for MB WAY Checkout support.
  apiVersion: "2025-10-29.clover" as any,
});
