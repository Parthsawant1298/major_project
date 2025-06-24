// 🔗 11. API ROUTE - VAPI WEBHOOK HANDLER
// File: app/api/webhook/vapi/route.js
// =================
import { NextResponse } from 'next/server';
import { processVAPIWebhook } from '@/lib/vapi-service';

export async function POST(request) {
  try {
    const webhookData = await request.json();
    
    // Verify webhook signature if needed
    const signature = request.headers.get('vapi-signature');
    
    // Process the webhook
    const result = await processVAPIWebhook(webhookData);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('VAPI webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
