"use server";

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;

export async function POST(req: NextRequest) {
  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  try {
    const { userId } = (await req.json()) as { userId?: string };
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();
    if (error || !profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
    }
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-04-10" });
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/keywords`,
    });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}


