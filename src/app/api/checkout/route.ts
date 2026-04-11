import { NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { createClient } from '@/lib/supabase/server';
import { configureLemonSqueezy, PLAN_VARIANT_IDS, STORE_ID } from '@/lib/lemonsqueezy';

export async function POST(req: Request) {
  try {
    const { plan } = (await req.json()) as { plan: string };

    if (!plan || !PLAN_VARIANT_IDS[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro" or "business".' },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Initialize LemonSqueezy
    configureLemonSqueezy();

    const variantId = PLAN_VARIANT_IDS[plan];

    // Create the checkout
    const { statusCode, data, error } = await createCheckout(
      STORE_ID,
      variantId,
      {
        checkoutData: {
          email: user.email ?? undefined,
          custom: {
            user_id: user.id,
            plan,
          },
        },
        productOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        },
      }
    );

    if (error || !data) {
      console.error('LemonSqueezy checkout error:', error, statusCode);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const checkoutUrl = data.data.attributes.url;

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error('Checkout route error:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
