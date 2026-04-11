import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const VALID_TYPES = ['bug', 'feature', 'general', 'other'] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, type, message } = body;

    // Validate
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabase.from('feedback').insert({
      name: name.trim(),
      email: email.trim(),
      type,
      message: message.trim(),
    });

    if (error) {
      console.error('Feedback insert error:', error);
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
