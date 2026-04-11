import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface WebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      plan?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      variant_id: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
  };
}

/**
 * Verify the webhook signature from LemonSqueezy.
 */
function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Map a plan name from custom_data or variant ID to the plan column value.
 */
function resolvePlan(customData?: { plan?: string }): string {
  const plan = customData?.plan;
  if (plan === 'pro' || plan === 'business') {
    return plan;
  }
  return 'free';
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event: WebhookEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;

    // Only handle subscription events
    if (
      eventName !== 'subscription_created' &&
      eventName !== 'subscription_updated'
    ) {
      return NextResponse.json({ received: true });
    }

    const customData = event.meta.custom_data;
    const userId = customData?.user_id;

    if (!userId) {
      console.error('Webhook missing user_id in custom_data');
      return NextResponse.json(
        { error: 'Missing user_id in custom_data' },
        { status: 400 }
      );
    }

    // Determine plan from custom_data or subscription status
    const subscriptionStatus = event.data.attributes.status;
    let plan = resolvePlan(customData);

    // If the subscription is cancelled or expired, revert to free
    if (subscriptionStatus === 'expired' || subscriptionStatus === 'cancelled') {
      plan = 'free';
    }

    // Use admin client to update the workspace plan (bypasses RLS)
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find the user's workspace (they are the owner)
    const { data: membership, error: memberError } = await admin
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .limit(1);

    if (memberError || !membership || membership.length === 0) {
      console.error('Webhook: could not find workspace for user', userId, memberError);
      return NextResponse.json(
        { error: 'Workspace not found for user' },
        { status: 404 }
      );
    }

    const workspaceId = membership[0].workspace_id;

    // Update the workspace plan
    const { error: updateError } = await admin
      .from('workspaces')
      .update({ plan })
      .eq('id', workspaceId);

    if (updateError) {
      console.error('Webhook: failed to update workspace plan', updateError);
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 500 }
      );
    }

    console.log(
      `Webhook: updated workspace ${workspaceId} to plan "${plan}" (event: ${eventName})`
    );

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
