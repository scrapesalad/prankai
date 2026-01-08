import { NextRequest, NextResponse } from "next/server";
import { templates, templateById } from "../../../lib/templates";
import { buildSystemPrompt, normalizeText, validatePromptInput } from "../../../lib/prompt";
import { isValidE164, normalizePhone } from "../../../lib/validation";

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;
const VAPI_PHONE_ID = process.env.VAPI_PHONE_ID;

export async function POST(request: NextRequest) {
  if (!VAPI_API_KEY || !VAPI_PHONE_ID) {
    return NextResponse.json({ error: "Missing Vapi credentials." }, { status: 500 });
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

  const normalizedPhone = normalizePhone(body.phoneNumber || "");
  if (!isValidE164(normalizedPhone)) {
    return NextResponse.json({ error: "Phone number must be valid E.164 (e.g., +15550001234)." }, { status: 400 });
  }

  const promptError = validatePromptInput(input, template.firstMessage);
  if (promptError) {
    return NextResponse.json({ error: promptError }, { status: 400 });
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
    return NextResponse.json({ error: data?.message || "Failed to start call." }, { status: response.status });
  }
  return NextResponse.json(data);
}
