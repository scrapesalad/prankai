// lib/prompt.ts

export type PromptInput = {
  callerName: string;
  culpritName: string;
  systemPrompt: string; // from template
  customPrompt: string; // from UI
  hook: string;
  confusion: string;
  escalation: string;
  resolution: string;
  silenceTimeout: number;
};

/**
 * Normalize user-entered text for prompt safety & cleanliness.
 * - trims
 * - collapses excessive whitespace
 * - strips weird control chars
 */
export function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ") // control chars
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Minimal, pragmatic validation so you don't ship empty/garbage prompts.
 */
export function validatePromptInput(input: PromptInput, templateFirstMessage: string): string | null {
  // Template must have a system prompt and first message
  if (!normalizeText(input.systemPrompt)) return "Template is missing a system prompt.";
  if (!normalizeText(templateFirstMessage)) return "Template is missing a first message.";

  // Required UX fields
  if (!normalizeText(input.culpritName)) return "Culprit name is required.";
  if (!normalizeText(input.callerName)) return "Caller persona is required.";

  // Conversation program should not be empty; allow short but not blank
  if (!normalizeText(input.hook)) return "Hook is required.";
  if (!normalizeText(input.confusion)) return "Confusion is required.";
  if (!normalizeText(input.escalation)) return "Escalation is required.";
  if (!normalizeText(input.resolution)) return "Resolution is required.";

  // Silence timeout range
  const t = Number(input.silenceTimeout);
  if (!Number.isFinite(t) || t < 3 || t > 20) return "Silence timeout must be between 3 and 20 seconds.";

  // Guard against extremely long prompts (keeps Vapi fast + avoids runaway tokens)
  const totalLen =
    input.systemPrompt.length +
    input.customPrompt.length +
    input.hook.length +
    input.confusion.length +
    input.escalation.length +
    input.resolution.length;

  if (totalLen > 9000) return "Prompt is too long. Shorten the template or conversation program.";

  return null;
}

/**
 * Builds the final system prompt your model sees.
 * This is where you make your “Conversation Program” actually drive behavior.
 */
export function buildSystemPrompt(input: PromptInput): string {
  const caller = normalizeText(input.callerName) || "Jordan";
  const culprit = normalizeText(input.culpritName) || "there";

  const templateSystem = normalizeText(input.systemPrompt)
    .replace("{culprit}", culprit)
    .replace("{caller}", caller);
  const custom = normalizeText(input.customPrompt);

  const hook = normalizeText(input.hook);
  const confusion = normalizeText(input.confusion);
  const escalation = normalizeText(input.escalation);
  const resolution = normalizeText(input.resolution);

  const silenceTimeout = Number(input.silenceTimeout) || 8;

  // Global safety + realism constraints (keeps it funny without crossing lines)
  const globalRules = `
Global Rules (must follow):
- Keep it playful, believable, and non-threatening.
- Do NOT claim to be law enforcement, a government agency, a bank, a debt collector, or anything that implies legal/financial consequences.
- Do NOT threaten, harass, or pressure the user to share sensitive personal data.
- If the user says “stop calling”, “do not call”, “unsubscribe”, or similar, politely end the call.
- If the user sounds genuinely upset, apologize, de-escalate, and end politely.
- If asked who you are: state your name calmly as "${caller}".
- Keep turns short. Ask simple questions to keep them engaged.
`.trim();

  // Conversation “runbook” used as a hidden structure
  const program = `
Conversation Program (use as your internal structure):
1) Hook:
"${hook}"

2) Confusion:
"${confusion}"

3) Escalation:
"${escalation}"

4) Resolution:
"${resolution}"

Execution guidance:
- Use the Hook within the first 1–2 turns.
- Move into Confusion immediately after the user’s first response.
- Escalate only if they stay engaged; keep stakes light and social.
- Offer Resolution when they seem ready to end or if confusion stalls.
`.trim();

  // Retention loop: makes “Six Seven” variants stick
  const retention = `
Retention Loop (repeat as needed):
- Ask a small clarifying question every 1–2 turns.
- React as if their answer “almost” clears it up:
  “Okay, that helps…”, “Right, got it…”, “That makes sense…”
- Add exactly ONE new vague detail that raises curiosity.
- Avoid explaining. Keep it moving.
`.trim();

  // Silence handling that works with your UI value
  const silence = `
Silence Handling:
- If the user is silent for ~${silenceTimeout} seconds, gently re-engage with one short line + one question.
  Example: “Hello? I might be cutting out—quick question though…”
- If silence continues twice, say a polite goodbye and end.
`.trim();

  // Personalization hints (lightweight)
  const personalization = `
Personalization:
- Address the user as "${culprit}" occasionally, not every line.
- Do not overuse their name; keep it natural.
`.trim();

  // Compose final system prompt (template first, then your “operating system”)
  return [
    templateSystem,
    "",
    `Identity: Your name is "${caller}". You are speaking with "${culprit}".`,
    "",
    globalRules,
    "",
    custom ? `Custom Instructions:\n${custom}` : "",
    "",
    program,
    "",
    retention,
    "",
    silence,
    "",
    personalization
  ]
    .filter(Boolean)
    .join("\n");
}
