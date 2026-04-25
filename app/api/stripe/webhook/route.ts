import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing webhook signature or secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Webhook verification failed." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

      if (supabaseAdmin) {
        await supabaseAdmin.from("orders").insert({
          stripe_session_id: session.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          total: (session.amount_total || 0) / 100,
          status: "confirmada"
        });

        if (subscriptionId) {
          await supabaseAdmin.from("subscriptions").upsert({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "active",
            plan_name: "PetBox"
          }, { onConflict: "stripe_subscription_id" });
        }
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      if (supabaseAdmin) {
        await supabaseAdmin.from("subscriptions").upsert({
          stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : null,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null
        }, { onConflict: "stripe_subscription_id" });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Webhook handling failed." }, { status: 500 });
  }
}
