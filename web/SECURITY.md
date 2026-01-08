# Security Implementation Guide

## Overview
This document outlines the security measures implemented in Prank Dial AI to prevent abuse, protect user privacy, and ensure legal compliance.

## Security Features Implemented

### 1. Rate Limiting ✅
**Location:** `lib/rate-limit.ts`

- **Call API:** 2 free calls per day (24 hours) per IP address
- **Dry-run API:** 20 dry-runs per hour per IP address
- Uses in-memory storage (upgrade to Redis/Upstash for production scaling)
- Returns HTTP 429 with `Retry-After` headers
- Automatic cleanup of expired entries

**Production Upgrade:**
```bash
# For production, use Upstash Redis or Vercel KV
npm install @upstash/redis
# Or use @vercel/kv if deploying to Vercel
```

### 2. Content Moderation ✅
**Location:** `lib/content-moderation.ts`

Blocks prohibited content including:
- **Illegal activities:** Weapons, drugs, swatting, counterfeiting
- **Impersonation:** Law enforcement, government, banks, medical professionals
- **Financial scams:** Phishing, account verification, payment requests
- **Harassment:** Threats, stalking, intimidation
- **Explicit content:** Sexual content, inappropriate dating
- **Spam patterns:** Multiple suspicious keywords combined

**Integration:** Applied in `/api/call/route.ts` before processing calls

### 3. Audit Logging ✅
**Location:** `lib/audit-log.ts`

Logs the following security events:
- Call attempts (success/failure, masked phone numbers)
- Rate limit violations
- Content moderation blocks
- Invalid input attempts

**Current:** Console logging
**Production TODO:** Integrate with proper logging service (Axiom, Datadog, CloudWatch)

### 4. Security Headers ✅
**Location:** `middleware.ts`

Implemented headers:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer data
- `Permissions-Policy` - Disables geolocation, microphone, camera
- `Content-Security-Policy` - Restricts script sources and frame embedding

### 5. Input Validation ✅
**Location:** `lib/validation.ts`, `lib/prompt.ts`

- E.164 phone number validation
- Control character stripping
- Prompt length limits (9,000 chars max)
- Required field validation
- Silence timeout bounds (3-20 seconds)

### 6. Legal Compliance ✅

#### Terms of Service
**Location:** `app/terms/page.tsx`

Includes:
- Prohibited conduct definitions
- TCPA compliance requirements
- Recording consent requirements (one-party vs two-party states)
- Age requirement (18+)
- Indemnification clause
- Service termination rights

#### Privacy Policy
**Location:** `app/privacy/page.tsx`

Covers:
- Data collection practices
- Third-party sharing (Vapi, OpenAI, ElevenLabs)
- User rights (CCPA, GDPR)
- Data retention policies
- Security measures
- Children's privacy (no users under 18)

## Critical Security TODOs for Production

### 1. Upgrade Rate Limiting to Distributed Storage
**Priority: HIGH**

Current implementation uses in-memory storage, which won't work across multiple server instances.

```typescript
// Replace in lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(identifier: string, config: RateLimitConfig) {
  const key = `ratelimit:${identifier}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, Math.ceil(config.windowMs / 1000));
  }

  if (count > config.maxRequests) {
    const ttl = await redis.ttl(key);
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: Date.now() + (ttl * 1000)
    };
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - count,
    reset: Date.now() + config.windowMs
  };
}
```

### 2. Implement Production Logging
**Priority: HIGH**

Replace console.log in `lib/audit-log.ts` with proper logging service:

**Option A: Axiom (Recommended)**
```bash
npm install @axiomhq/js
```

**Option B: Datadog**
```bash
npm install dd-trace
```

**Option C: Vercel Log Drains**
Configure in Vercel dashboard, no code changes needed.

### 3. Add Environment-Specific Configurations
**Priority: MEDIUM**

Create `.env.production` with stricter limits:

```bash
# Production rate limits (stricter)
RATE_LIMIT_CALLS_PER_HOUR=3
RATE_LIMIT_DRYRUNS_PER_HOUR=10

# Logging
AXIOM_API_TOKEN=your_token_here
AXIOM_DATASET=prankai-production

# Security
NODE_ENV=production
```

### 4. Implement User Authentication (Optional but Recommended)
**Priority: MEDIUM**

For better abuse prevention, consider adding:
- Clerk.com authentication
- Google OAuth
- Email verification

This allows:
- Per-user rate limiting (not just IP-based)
- User banning capabilities
- Usage analytics per user

### 5. Add Webhook Signature Verification
**Priority: MEDIUM**

If you receive webhooks from Vapi:

```typescript
// lib/webhook-verification.ts
import crypto from 'crypto';

export function verifyVapiWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### 6. Set Up Monitoring & Alerts
**Priority: HIGH**

Monitor for:
- Rate limit violations spike
- Content moderation blocks spike
- API error rates
- Abnormal call volumes

Recommended tools:
- **Vercel Analytics** (included)
- **Better Stack** (uptime monitoring)
- **Sentry** (error tracking)

### 7. Geographic Restrictions (Optional)
**Priority: LOW**

If needed, restrict service to specific countries:

```typescript
// middleware.ts
const country = request.geo?.country;
const allowedCountries = ['US', 'CA', 'GB'];

if (!allowedCountries.includes(country || '')) {
  return NextResponse.json(
    { error: 'Service not available in your region' },
    { status: 451 }
  );
}
```

## Environment Variables Checklist

Ensure these are set in production:

```bash
# Required
VAPI_PRIVATE_KEY=
VAPI_PHONE_ID=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=https://prankai.com

# Recommended for production
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
AXIOM_API_TOKEN=
AXIOM_DATASET=

# Optional
SENTRY_DSN=
```

## Deployment Checklist

Before deploying to production:

- [ ] Migrate rate limiting to Redis/Upstash
- [ ] Configure production logging service
- [ ] Set up error monitoring (Sentry)
- [ ] Configure uptime monitoring
- [ ] Review and update rate limits for production traffic
- [ ] Test content moderation with edge cases
- [ ] Verify all environment variables are set
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up custom domain with DNS
- [ ] Configure SPF/DKIM for email (if sending)
- [ ] Review Terms of Service with legal counsel
- [ ] Set up automated backups for logs
- [ ] Create incident response plan

## Incident Response

If abuse is detected:

1. **Immediate:** Block IP address via rate limiter
2. **Investigation:** Review audit logs for patterns
3. **Escalation:** Report to Vapi/OpenAI if ToS violation
4. **Prevention:** Update content moderation patterns
5. **Documentation:** Document incident and response

## Legal Compliance

### TCPA Compliance
- Users must confirm consent before placing calls
- Clear disclosure of automated calling
- End-call phrases implemented ("stop calling", etc.)
- Record keeping of consent

### Recording Consent Laws
- One-party consent: Tracked but not enforced (user responsibility)
- Two-party consent: Warning shown to users
- Users responsible for compliance in their jurisdiction

### Data Privacy (GDPR/CCPA)
- Privacy policy linked in footer
- Data retention policies documented
- User rights explained
- Contact method for data requests

## Security Contact

For security concerns or vulnerability reports:
- Open a GitHub issue (for non-sensitive issues)
- Email: [Add security contact email]

## Regular Security Reviews

Schedule quarterly reviews of:
- Rate limit effectiveness
- Content moderation patterns
- Audit log analysis
- Third-party dependency updates
- Security header configurations
