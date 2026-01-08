export type TemplateMetrics = {
  total: number;
  answered: number;
  hangup10: number;
  duration: number;
  laugh: number;
};

const safeSeconds = (started?: string, ended?: string) => {
  if (!started || !ended) return 0;
  const start = new Date(started).getTime();
  const end = new Date(ended).getTime();
  return Math.max(0, (end - start) / 1000);
};

const transcriptText = (call: any) =>
  call?.transcript || call?.artifact?.transcript || "";

const laughEvent = (call: any) => {
  const text = transcriptText(call).toLowerCase();
  if (["lol", "haha", "hahaha", "lmao"].some((t) => text.includes(t))) return true;
  return Boolean(call?.numUserInterrupted || call?.numAssistantInterrupted);
};

export const computeMetrics = (calls: any[], templateName: (call: any) => string) => {
  const metrics: Record<string, TemplateMetrics> = {};
  calls.forEach((call) => {
    const name = templateName(call);
    if (!metrics[name]) {
      metrics[name] = { total: 0, answered: 0, hangup10: 0, duration: 0, laugh: 0 };
    }
    const m = metrics[name];
    m.total += 1;
    const duration = safeSeconds(call?.startedAt, call?.endedAt);
    if (duration > 0) m.answered += 1;
    if (duration > 0 && duration <= 10) m.hangup10 += 1;
    m.duration += duration;
    if (laughEvent(call)) m.laugh += 1;
  });
  return metrics;
};

export const leaderboardRows = (metrics: Record<string, TemplateMetrics>) => {
  return Object.entries(metrics)
    .map(([template, data]) => {
      const avg = data.answered ? data.duration / data.answered : 0;
      const answerRate = data.total ? Math.round((data.answered / data.total) * 100) : 0;
      const hangupRate = data.total ? Math.round((data.hangup10 / data.total) * 100) : 0;
      return {
        template,
        answerRate,
        hangupRate,
        avgDuration: Math.round(avg),
        laughEvents: data.laugh
      };
    })
    .sort((a, b) => b.answerRate - a.answerRate);
};
