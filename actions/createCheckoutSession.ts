"use server";

import { UserDetails } from "@/lib/userDetails";
import { adminDb } from "@/firebase/firebaseAdmin";
import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import getBaseUrl from "@/lib/getBaseUrl";

export async function createCheckoutSession(userDetails: UserDetails) {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not found");
    }

    // first check if the user has an active subscription
    let stripeCustomerId;

    const user = await adminDb.collection("users").doc(userId).get();
    stripeCustomerId = user.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
        // create a new stripe customer
        const customer = await stripe.customers.create({
            email: userDetails.email,
            name: userDetails.name,
            metadata: {
                userId,
            },
        });

        await adminDb.collection("users").doc(userId).set({
            stripeCustomerId: customer.id,
        });

        stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paypal"],
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1,
            },
        ],

        mode: "subscription",
        customer: stripeCustomerId,
        success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
        cancel_url: `${getBaseUrl()}/upgrade`,
    });
    
    return session.id;
}