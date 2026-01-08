# PayPal Integration Setup Guide

## Overview
Your PrankAI app now has a complete PayPal payment system integrated! Users can upgrade from the free tier (2 calls/day) to paid plans.

## Pricing Tiers

1. **Free Tier** (Default)
   - 2 calls per day
   - Resets every 24 hours

2. **Daily Pass** - $4.99
   - 10 calls
   - Valid for 24 hours

3. **Weekly Pass** - $14.99 (Most Popular)
   - 50 calls
   - Valid for 7 days
   - 40% savings vs daily

4. **Monthly Pass** - $29.99
   - Unlimited calls
   - Valid for 30 days

## Setup Instructions

### Step 1: Get Your PayPal Client ID

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account (lafaverspam@gmail.com)
3. Navigate to **Apps & Credentials**
4. Create a new app or use an existing one
5. Copy your **Client ID** (starts with "AX..." or similar)

### Step 2: Add Client ID to Your App

Open `k:\prankai\web\app\upgrade\page.tsx` and replace line 16:

**Current:**
```typescript
script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD&intent=capture";
```

**Replace with:**
```typescript
script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID_HERE&currency=USD&intent=capture";
```

### Step 3: Test in Sandbox Mode (Recommended)

Before going live, test with PayPal Sandbox:

1. In PayPal Developer Dashboard, switch to **Sandbox** mode
2. Use the **Sandbox Client ID** in your code
3. Create test buyer/seller accounts in the dashboard
4. Test all three payment tiers

### Step 4: Switch to Production

Once testing is complete:

1. Switch to **Live** mode in PayPal Dashboard
2. Get your **Live Client ID**
3. Replace the sandbox Client ID with the live one
4. Deploy to production

## How It Works

### User Flow

1. User visits `/upgrade` page
2. Clicks PayPal button for their chosen plan
3. Completes payment through PayPal
4. Redirected to `/upgrade/success`
5. Purchase stored in browser localStorage
6. Can immediately use purchased calls

### Technical Flow

1. **Payment Processing**
   - PayPal SDK handles the checkout
   - Payment goes directly to lafaverspam@gmail.com
   - Order ID returned on success

2. **Call Tracking**
   - Purchase stored in `localStorage` as JSON
   - Contains: orderId, plan, calls, callsUsed, expiresAt
   - API checks purchase validity before allowing calls
   - Each successful call increments `callsUsed`

3. **Rate Limiting Bypass**
   - Free tier: 2 calls/day (rate limited by IP)
   - Paid tier: Uses purchased call count (bypasses IP rate limit)
   - API validates purchase on each request

## Files Added/Modified

### New Files
- `/web/app/upgrade/page.tsx` - Upgrade page with PayPal buttons
- `/web/app/upgrade/success/page.tsx` - Success confirmation page
- `/web/app/api/verify-purchase/route.ts` - Purchase verification endpoint
- `/web/lib/purchase.ts` - Purchase tracking utilities
- `/web/components/CallsRemaining.tsx` - Shows remaining calls widget

### Modified Files
- `/web/app/api/call/route.ts` - Checks for purchased calls, bypasses rate limit
- `/web/app/page.tsx` - Integrated purchase checking and call tracking

## Environment Variables

Add to `.env.local`:

```bash
# Optional: For webhook verification (production enhancement)
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

## Security Notes

### Current Implementation
- Purchase data stored in browser localStorage
- Client sends purchase data with each call
- Server validates expiry and remaining calls
- No database required for basic functionality

### Production Enhancements (Recommended)

1. **Add Database Tracking**
   - Store purchases in a database (PostgreSQL, MongoDB, etc.)
   - Verify OrderID with PayPal API
   - Prevent replay attacks

2. **Implement Webhooks**
   - Listen for PayPal webhook events
   - Validate webhook signatures
   - Update database on payment events

3. **Add User Authentication**
   - Require login to purchase
   - Tie purchases to user accounts
   - Enable purchase history

Example webhook verification:
```typescript
// app/api/webhooks/paypal/route.ts
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('paypal-transmission-sig');

  // Verify webhook signature
  const isValid = verifyPayPalSignature(body, signature);

  if (isValid) {
    const event = JSON.parse(body);
    // Store purchase in database
    await storePurchase(event.resource.id, event.resource);
  }

  return NextResponse.json({ received: true });
}
```

## Testing

### Test Different Scenarios

1. **Free Tier Limits**
   - Make 2 calls
   - Verify 3rd call is blocked
   - Wait 24 hours, verify reset

2. **Daily Pass Purchase**
   - Purchase daily pass
   - Verify 10 calls available
   - Use all 10 calls
   - Verify blocked after 10

3. **Weekly Pass Purchase**
   - Purchase weekly pass
   - Verify 50 calls available
   - Check expiry date is 7 days out

4. **Monthly Pass (Unlimited)**
   - Purchase monthly pass
   - Make many calls
   - Verify never blocked
   - Check expiry date is 30 days out

5. **Expiry Handling**
   - Purchase a plan
   - Manually edit localStorage to set past expiry
   - Verify reverts to free tier

## Monetization Tips

1. **Add Upsells**
   - Show upgrade banner after 1st free call used
   - Highlight savings on weekly pass
   - Add limited-time discounts

2. **Email Collection**
   - Collect emails before purchase
   - Send purchase confirmations
   - Enable re-engagement campaigns

3. **Analytics**
   - Track conversion rates
   - Monitor which plans sell best
   - A/B test pricing

4. **Referral Program**
   - Give 5 free calls for successful referrals
   - Add social sharing buttons
   - Track referral codes

## Troubleshooting

### PayPal Button Not Loading
- Check Client ID is correct
- Verify no ad blockers
- Check console for JavaScript errors

### Payment Successful But Calls Not Added
- Check localStorage in browser DevTools
- Verify purchase object structure
- Check API logs for purchase validation

### Rate Limit Still Applying After Purchase
- Ensure purchase data being sent in API call
- Check expiry date is in future
- Verify remaining calls > 0

## Support

For PayPal integration issues:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Forum](https://www.paypal-community.com/t5/Developer-Forums/ct-p/developer-forums)

For technical issues with the integration:
- Check browser console for errors
- Review API logs for rate limit/purchase messages
- Test in PayPal Sandbox mode first
