// lib/audit-log.ts
// Simple audit logging for call attempts and security events

export type AuditLogEntry = {
  timestamp: string;
  event: string;
  ip: string;
  phoneNumber?: string;
  templateId?: string;
  success: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
};

// In production, send these to a logging service (Axiom, Datadog, CloudWatch, etc.)
export function logAuditEvent(entry: AuditLogEntry): void {
  const logEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };

  // For now, just console.log (in production, use proper logging)
  console.log("[AUDIT]", JSON.stringify(logEntry));

  // TODO: Send to logging service
  // await fetch('https://your-logging-service.com/logs', {
  //   method: 'POST',
  //   body: JSON.stringify(logEntry)
  // });
}

export function logCallAttempt(data: {
  ip: string;
  phoneNumber: string;
  templateId: string;
  success: boolean;
  reason?: string;
}): void {
  logAuditEvent({
    timestamp: new Date().toISOString(),
    event: "call_attempt",
    ip: data.ip,
    phoneNumber: maskPhoneNumber(data.phoneNumber),
    templateId: data.templateId,
    success: data.success,
    reason: data.reason
  });
}

export function logSecurityEvent(data: {
  ip: string;
  event: "rate_limit" | "content_moderation" | "invalid_input";
  reason: string;
  metadata?: Record<string, unknown>;
}): void {
  logAuditEvent({
    timestamp: new Date().toISOString(),
    event: data.event,
    ip: data.ip,
    success: false,
    reason: data.reason,
    metadata: data.metadata
  });
}

// Mask phone numbers in logs for privacy (show last 4 digits)
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return "****";
  return "****" + phone.slice(-4);
}
