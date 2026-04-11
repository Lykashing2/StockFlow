import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

export function configureLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
    onError: (error) => {
      console.error('LemonSqueezy error:', error.message);
    },
  });
}

/**
 * LemonSqueezy variant IDs for each plan.
 * Replace these with your actual variant IDs from the LemonSqueezy dashboard.
 */
export const PLAN_VARIANT_IDS: Record<string, number> = {
  pro: 000000,      // TODO: Replace with your Pro plan variant ID
  business: 000000, // TODO: Replace with your Business plan variant ID
};

export const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;
