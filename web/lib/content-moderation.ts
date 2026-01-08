// lib/content-moderation.ts
// Content moderation to prevent abuse and platform violations

type ModerationResult = {
  allowed: boolean;
  reason?: string;
  category?: string;
};

// Prohibited content patterns
const PROHIBITED_PATTERNS = {
  // Illegal activities
  illegal: [
    /\b(bomb|explosive|weapon|gun|kill|murder|harm|hurt|attack)\b/i,
    /\b(drug|cocaine|meth|heroin|fentanyl)\s+(deal|sell|buy)/i,
    /\bswat(ting)?\b/i,
    /\b(fake|counterfeit)\s+(money|currency|bills)/i
  ],

  // Impersonation (highly regulated)
  impersonation: [
    /\b(police|cop|officer|sheriff|deputy|detective)\b/i,
    /\b(fbi|cia|nsa|dea|atf|secret service)\b/i,
    /\b(irs|tax|revenue)\s+(agent|officer|collector)/i,
    /\b(bank|credit card|account)\s+(fraud|suspended|locked|frozen)/i,
    /\b(social security|ssn|medicare)\b/i,
    /\b(immigration|ice|deportation|visa)\b/i,
    /\b(court|judge|lawyer|attorney|legal action|lawsuit)\b/i,
    /\b(warrant|arrest|subpoena)\b/i,
    /\bdebt\s+collector\b/i,
    /\b(doctor|physician|hospital|medical emergency)\b/i
  ],

  // Financial scams
  financial: [
    /\b(send|wire|transfer|pay|payment)\s+(money|cash|bitcoin|crypto)/i,
    /\b(credit card|bank account|routing number|ssn)\s+(number|info|details)/i,
    /\byou('ve| have)\s+(won|inherited|been selected)/i,
    /\b(urgent|immediate)\s+(payment|action required)/i,
    /\baccount\s+(suspended|locked|frozen|compromised)/i
  ],

  // Harassment/threats
  harassment: [
    /\b(threaten|intimidate|blackmail|extort)\b/i,
    /\bi\s+(know where you|have your address|found you)/i,
    /\byou('ll| will)\s+(regret|pay|suffer)/i,
    /\b(stalk|follow|watch|track)(ing|ed)?\s+you\b/i
  ],

  // Explicit sexual content
  sexual: [
    /\b(sex|sexual|explicit|pornographic|nude|naked)\b/i,
    /\b(dating|hookup|meet up)\s+(tonight|now)/i
  ],

  // Spam/scams
  spam: [
    /\b(click|visit|go to)\s+(this link|this website|http)/i,
    /\bfree\s+(gift|prize|vacation|cruise|iphone)/i,
    /\blimited time offer\b/i,
    /\bact now\b/i
  ]
};

// Check for prohibited keywords in user inputs
export function moderateContent(text: string): ModerationResult {
  const normalized = text.toLowerCase().trim();

  // Check each category
  for (const [category, patterns] of Object.entries(PROHIBITED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return {
          allowed: false,
          reason: `Content contains prohibited ${category} references`,
          category
        };
      }
    }
  }

  // Additional checks for multiple suspicious patterns
  const suspiciousCount = [
    /\bmoney\b/i,
    /\burgent\b/i,
    /\bimmediately\b/i,
    /\bverify\b/i,
    /\baccount\b/i,
    /\bconfirm\b/i,
    /\bsuspended\b/i
  ].filter((pattern) => pattern.test(normalized)).length;

  if (suspiciousCount >= 3) {
    return {
      allowed: false,
      reason: "Content contains multiple suspicious scam patterns",
      category: "suspicious"
    };
  }

  return { allowed: true };
}

// Moderate all user-provided inputs for a call
export function moderateCallInputs(input: {
  callerName: string;
  culpritName: string;
  customPrompt: string;
  hook: string;
  confusion: string;
  escalation: string;
  resolution: string;
}): ModerationResult {
  const allText = [
    input.callerName,
    input.culpritName,
    input.customPrompt,
    input.hook,
    input.confusion,
    input.escalation,
    input.resolution
  ].join(" ");

  return moderateContent(allText);
}
