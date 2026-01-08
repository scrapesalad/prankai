import { NextRequest, NextResponse } from "next/server";
import { templates, templateById } from "../../../lib/templates";
import { buildSystemPrompt, normalizeText, validatePromptInput } from "../../../lib/prompt";
import { isValidE164, normalizePhone } from "../../../lib/validation";
import { rateLimit, getClientIdentifier } from "../../../lib/rate-limit";
import { moderateCallInputs } from "../../../lib/content-moderation";
import { logCallAttempt, logSecurityEvent } from "../../../lib/audit-log";

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;
const VAPI_PHONE_ID = process.env.VAPI_PHONE_ID;

export async function POST(request: NextRequest) {
  const clientIp = getClientIdentifier(request);

  if (!VAPI_API_KEY || !VAPI_PHONE_ID) {
    return NextResponse.json({ error: "Missing Vapi credentials." }, { status: 500 });
  }

  const body = await request.json();

  // Check for purchased calls (bypass rate limiting if valid)
  const purchase = body.purchase;
  let hasPurchase = false;
  let rateLimitResult = null;

  if (purchase?.orderId && purchase?.expiresAt) {
    // Validate purchase
    const expiry = new Date(purchase.expiresAt);
    const remaining = (purchase.calls || 0) - (purchase.callsUsed || 0);

    if (expiry > new Date() && remaining > 0) {
      hasPurchase = true;
      // Log paid call
      console.log(`[PAID CALL] Order: ${purchase.orderId}, Plan: ${purchase.plan}, Remaining: ${remaining}`);
    }
  }

  // Only check rate limiting for free tier users
  if (!hasPurchase) {
    rateLimitResult = await rateLimit(`call:${clientIp}`, {
      maxRequests: 2,
      windowMs: 24 * 60 * 60 * 1000 // 24 hours
    });

    if (!rateLimitResult.success) {
      logSecurityEvent({
        ip: clientIp,
        event: "rate_limit",
        reason: "Free tier rate limit exceeded",
        metadata: { limit: rateLimitResult.limit }
      });

      return NextResponse.json(
        {
          error: "Rate limit exceeded. You get 2 free calls per day. Upgrade for more calls."
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }
  }
  const customTemplate = body?.template;
  const template =
    customTemplate && typeof customTemplate.systemPrompt === "string" && typeof customTemplate.firstMessage === "string"
      ? customTemplate
      : templateById[body.templateId] || templates[0];

  const input = {
    callerName: normalizeText(body.callerName),
    culpritName: normalizeText(body.culpritName),
    systemPrompt: template.systemPrompt,
    customPrompt: normalizeText(body.customPrompt),
    hook: normalizeText(body.hook),
    confusion: normalizeText(body.confusion),
    escalation: normalizeText(body.escalation),
    resolution: normalizeText(body.resolution),
    silenceTimeout: Number(body.silenceTimeout) || 8
  };

  const normalizedPhone = normalizePhone(body.phoneNumber || "");
  if (!isValidE164(normalizedPhone)) {
    logSecurityEvent({
      ip: clientIp,
      event: "invalid_input",
      reason: "Invalid phone number format"
    });
    return NextResponse.json({ error: "Phone number must be valid E.164 (e.g., +15550001234)." }, { status: 400 });
  }

  const promptError = validatePromptInput(input, template.firstMessage);
  if (promptError) {
    logSecurityEvent({
      ip: clientIp,
      event: "invalid_input",
      reason: promptError
    });
    return NextResponse.json({ error: promptError }, { status: 400 });
  }

  // Content moderation
  const moderationResult = moderateCallInputs(input);
  if (!moderationResult.allowed) {
    logSecurityEvent({
      ip: clientIp,
      event: "content_moderation",
      reason: moderationResult.reason || "Prohibited content detected",
      metadata: { category: moderationResult.category }
    });

    return NextResponse.json(
      {
        error:
          "Your content contains prohibited patterns. Prank calls must be playful and non-threatening. Do not impersonate law enforcement, government agencies, financial institutions, or use threatening/harassing language."
      },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(input);
  const firstMessage = template.firstMessage
    .replace("{culprit}", input.culpritName || "there")
    .replace("{caller}", input.callerName || "there");

  const payload = {
    phoneNumberId: VAPI_PHONE_ID,
    customer: { number: normalizedPhone },
    assistant: {
      backgroundSound: "off",
      recordingEnabled: Boolean(body.recordCall),
      monitorPlan: {
        listenEnabled: Boolean(body.liveListen),
        listenAuthenticationEnabled: false
      },
      metadata: { templateName: template.id },
      endCallPhrases: [
        "stop calling",
        "do not call",
        "don't call",
        "remove me",
        "take me off your list",
        "stop",
        "unsubscribe"
      ],
      endCallMessage: "Understood. I will not call again. Goodbye.",
      firstMessage,
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }]
      },
      voice: {
        provider: "11labs",
        voiceId: "ETkKuFgSSzTTF4mWHh9V"
      }
    }
  };

  const response = await fetch("https://api.vapi.ai/call/phone", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    logCallAttempt({
      ip: clientIp,
      phoneNumber: normalizedPhone,
      templateId: template.id,
      success: false,
      reason: data?.message || "Vapi API error"
    });
    return NextResponse.json({ error: data?.message || "Failed to start call." }, { status: response.status });
  }

  logCallAttempt({
    ip: clientIp,
    phoneNumber: normalizedPhone,
    templateId: template.id,
    success: true
  });

  const responseHeaders: Record<string, string> = {};

  if (rateLimitResult !== null) {
    responseHeaders["X-RateLimit-Limit"] = rateLimitResult.limit.toString();
    responseHeaders["X-RateLimit-Remaining"] = rateLimitResult.remaining.toString();
    responseHeaders["X-RateLimit-Reset"] = new Date(rateLimitResult.reset).toISOString();
  }

  if (hasPurchase) {
    responseHeaders["X-Purchase-Used"] = "true";
  }

  return NextResponse.json(data, { headers: responseHeaders });
}
