"use client";

import { createCheckoutSession } from "@/actions/createCheckoutSession";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";
import getStripe from "@/lib/stripe-js";
import { useUser } from "@clerk/nextjs";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";


export type UserDetails = {
    email: string;
    name: string;
};

function PricingPage() {
    const { user } = useUser();
    const router = useRouter();
    const { hasActiveMembership, loading } = useSubscription();
    const [isPending, startTransition] = useTransition();

    const handleUpgrade = () => {
        if (!user) return;
        const userDetails: UserDetails = {
            email: user.primaryEmailAddress?.toString()!,
            name: user.fullName!,
        };
        startTransition(async () => {
            const stripe = await getStripe();

            if (hasActiveMembership) {
                // create Stripe Portal
            }
            const sessionId = await createCheckoutSession(userDetails);

            await stripe?.redirectToCheckout({
                sessionId,
            });
        });
    };

    return (
        <div>
            <div className="py-24 sm:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-semibold leading-7 text-indigo-600">
                        Pricing
                    </h2>
                    <p className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Supercharge your Document Companion
                    </p>
                </div>
                <p className="mx-auto mt-6 mx-w-2xl px-10 text-center text-lg leading-8 text-gray-600">
                    Choose an afforable plan thats packet with the best features
                    for interacting with your PDFs, enhancing your productivity, and
                    streamlining your workflow.
                </p>               
                <div className="max-w-md mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 md:max-w-2xl gap-8 lg:max-w-4xl">
                    {/* Free */}
                    <div className="ring-2 ring-gray-300 p-8 h-fit pb-12 rounded-3xl">
                        <h3 className="text-lg font-semibold leading-8 text-gray-900">
                            Starter Plan
                        </h3>
                        <p className="mt-4 text-sm leading-6 text-gray-600">
                            Explore the Core Features at No Coast!
                        </p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-gray-600">
                                Free
                            </span>
                        </p>
                        <ul
                            role="list"
                            className="mt-8 space-y-e text-sm leading-6 text-gray-600"
                        >
                            <li className="flex gap-x-3">
                                <CheckIcon className="w-5 h-6 flex-none text-indigo-600" />
                                2 Documents
                            </li>
                            <li className="flex gap-x-3">
                                <CheckIcon className="w-5 h-6 flex-none text-indigo-600" />
                                Up to 3 messages per document
                            </li>
                            <li className="flex gap-x-3">
                                <CheckIcon className="w-5 h-6 flex-none text-indigo-600" />
                                Try out the AI Chat Functionality
                            </li>
                        </ul>
                    </div>
                    {/* PRO */}        
                    <div className="ring-2 ring-indigo-600 p-8 h-fit pb-12 rounded-3xl">
                        <h3 className="text-lg font-semibold leading-8 text-gray-900">
                            Pro Plan
                        </h3>
                        <p className="mt-4 text-sm leading-6 text-gray-600">
                            Maximize Productivity with PRO Features!
                        </p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-gray-900">
                                $5.99
                            </span>
                            <span className="text-sm font-semibold leading-6 text-gray-600">
                                /month
                            </span>
                        </p>
                        <Button 
                            className="bg-indigo-600 w-full text-white shadow-sm hover:bg-indigo-500 mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visibile:outline focus-visible:outline-2 focus-visibile:outline-offset-2 focus=visible:outline-indigo-600"
                            disabled={loading || isPending}
                            onClick={handleUpgrade}
                        >
                            {
                                isPending || loading
                                    ? "Loading..."
                                    : hasActiveMembership
                                        ? "Manage Subscription"
                                        : "Upgrade to Pro"
                            }
                        </Button>
                        <ul
                            role="list"
                            className="mt-8 space-y-e text-sm leading-6 text-gray-600"
                        >
                            <li className="flex gap-x-3">
                                <CheckIcon className="w-5 h-6 flex-none text-indigo-600" />
                                Store Up to 20 Documents
                            </li>
                            <li className="flex gap-x-3">
                                <CheckIcon className="w-5 h-6 flex-none text-indigo-600" />
                                Ability to Delete Documents
                            </li>
                            <li className="flex gap-x-3">
                                <CheckIcon className="w-5 h-6 flex-none text-indigo-600" />
                                Up to 100 messages per document
                            </li>
                            <li className="flex gap-x-3">
                                <CheckIcon className="w-5 h-6 flex-none text-indigo-600" />
                                Try out the AI Functionality
                            </li>
                            <li className="flex gap-x-3">
                                <CheckIcon className="w-5 h-6 flex-none text-indigo-600" />
                                AI Chat with Memory Recall
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PricingPage;