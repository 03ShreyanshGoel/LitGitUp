import { db } from "@/server/db";
import { error } from "console";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { useId } from "react";
import Stripe from "stripe";

// /api/webhook/stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia'
})

export async function POST(request: Request) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') as string;
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (error) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    const session = event.data.object as Stripe.Checkout.Session
    console.log(event.type)
    if (event.type === 'checkout.session.completed') {
        const credits = Number(session.metadata?.['credits'])
        const userId = session.client_reference_id as string | undefined
        if (!userId || !credits) {
            return NextResponse.json({ error: 'Missing userId or credits' }, { status: 400 })
        }
        await db.stripeTransaction.create({ data: { userId, credits } })
        await db.user.update({
            where: { id: userId }, data: {
                credits: {
                    increment: credits
                }
            }
        })
    }
    return NextResponse.json({ message: 'Hello, world!' })
}