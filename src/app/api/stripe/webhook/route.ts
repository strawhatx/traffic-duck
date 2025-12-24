
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-04-10" });

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.user_id as string) ?? (session.client_reference_id as string);
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string | null;
        if (userId && customerId) {
          await supabaseAdmin
            .from("profiles")
            .upsert({ id: userId, stripe_customer_id: customerId })
            .throwOnError();
        }
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: sub.status,
              price_id: (sub.items.data[0]?.price?.id as string) ?? null,
              current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            })
            .eq("id", userId)
            .throwOnError();
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        // Find profile by customer id
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (profile?.id) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: sub.status,
              price_id: (sub.items.data[0]?.price?.id as string) ?? null,
              current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            })
            .eq("id", profile.id)
            .throwOnError();
        }
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Webhook handler error" }, { status: 500 });
  }
}

export const runtime = "nodejs";


