import { NextRequest, NextResponse } from "next/server";
import { templates, templateById } from "../../../lib/templates";

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;
const VAPI_PHONE_ID = process.env.VAPI_PHONE_ID;

export async function POST(request: NextRequest) {
  if (!VAPI_API_KEY || !VAPI_PHONE_ID) {
    return NextResponse.json({ error: "Missing Vapi credentials." }, { status: 500 });
  }

  const body = await request.json();
  const template = templateById[body.templateId] || templates[0];

  const systemPrompt = [
    `You are ${body.callerName}.`,
    template.systemPrompt.replace("{culprit}", body.culpritName || "there"),
    "",
    "Conversation phases:",
    `- Hook: ${body.hook}`,
    `- Confusion: ${body.confusion}`,
    `- Escalation: ${body.escalation}`,
    `- Resolution: ${body.resolution}`,
    "",
    "Rules:",
    "- Ask 1 question at a time.",
    "- Mirror the user's last phrase briefly before your next question.",
    "- Confirm key details when mentioned.",
    "- Avoid long monologues (keep responses under 2 sentences when possible).",
    "",
    `Additional instructions: ${body.customPrompt}`,
    "",
    "Exit triggers:",
    "- If the user is upset or asks to stop, apologize and end the call.",
    `- If silence for ${body.silenceTimeout} seconds, politely end the call.`
  ].join("\n");

  const payload = {
    phoneNumberId: VAPI_PHONE_ID,
    customer: { number: body.phoneNumber },
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
      firstMessage: template.firstMessage.replace("{culprit}", body.culpritName || "there"),
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
