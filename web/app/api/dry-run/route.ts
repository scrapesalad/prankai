import { NextRequest, NextResponse } from "next/server";
import { templates, templateById } from "../../../lib/templates";
import { buildSystemPrompt, normalizeText, validatePromptInput } from "../../../lib/prompt";
import { rateLimit, getClientIdentifier } from "../../../lib/rate-limit";
import { logSecurityEvent } from "../../../lib/audit-log";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  const clientIp = getClientIdentifier(request);

  // Rate limiting: 20 dry-runs per hour per IP
  const rateLimitResult = await rateLimit(`dry-run:${clientIp}`, {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000 // 1 hour
  });

  if (!rateLimitResult.success) {
    logSecurityEvent({
      ip: clientIp,
      event: "rate_limit",
      reason: "Dry-run rate limit exceeded",
      metadata: { limit: rateLimitResult.limit }
    });

    return NextResponse.json(
      {
        error: "Rate limit exceeded. You can run 20 dry-runs per hour. Please try again later."
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString()
        }
      }
    );
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OpenAI credentials." }, { status: 500 });
  }

  const body = await request.json();
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

  const userMessage = normalizeText(body.userMessage);
  if (!userMessage) {
    return NextResponse.json({ error: "Dry-run user message cannot be empty." }, { status: 400 });
  }

  const promptError = validatePromptInput(input, template.firstMessage);
  if (promptError) {
    return NextResponse.json({ error: promptError }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(input);
  const firstMessage = template.firstMessage
    .replace("{culprit}", input.culpritName || "there")
    .replace("{caller}", input.callerName || "there");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: firstMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 0.6
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data?.error?.message || "Dry-run failed." }, { status: response.status });
  }

  const content = data?.choices?.[0]?.message?.content;
  return NextResponse.json(
    { content },
    {
      headers: {
        "X-RateLimit-Limit": rateLimitResult.limit.toString(),
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString()
      }
    }
  );
}
