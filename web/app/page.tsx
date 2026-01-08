"use client";

import { useEffect, useMemo, useState } from "react";
import { Template, templates, templateById } from "../lib/templates";
import { isValidE164 } from "../lib/validation";
import CopyLink from "../components/CopyLink";

type CallResponse = {
  id?: string;
  monitor?: { listenUrl?: string };
  error?: string;
};

export default function HomePage() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const templateParam = params?.get("template") || "";
  const defaultTemplate = templateById[templateParam] || templates[0];

  const [templateId, setTemplateId] = useState(defaultTemplate.id);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const templateList = useMemo(() => [...templates, ...customTemplates], [customTemplates]);
  const template = useMemo(
    () => templateList.find((item) => item.id === templateId) || templateList[0],
    [templateList, templateId]
  );

  const [culpritName, setCulpritName] = useState("Chris");
  const [callerName, setCallerName] = useState("Sterling");
  const [customPrompt, setCustomPrompt] = useState(
    "Keep the tone playful but believable. If they ask who this is, restate your name calmly."
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recordCall, setRecordCall] = useState(true);
  const [liveListen, setLiveListen] = useState(true);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("not-sure");
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [hook, setHook] = useState("Open with a friendly, specific reason for the call.");
  const [confusion, setConfusion] = useState("Introduce a small, believable confusion that needs clarification.");
  const [escalation, setEscalation] = useState("Increase urgency just a bit, but keep it light and non-threatening.");
  const [resolution, setResolution] = useState("Offer a simple resolution and end politely if they seem done.");
  const [silenceTimeout, setSilenceTimeout] = useState(8);
  const [status, setStatus] = useState<string>("");
  const [call, setCall] = useState<CallResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [dryRunMessage, setDryRunMessage] = useState("Hello? Who is this?");
  const [dryRunStatus, setDryRunStatus] = useState("");
  const [dryRunResponse, setDryRunResponse] = useState("");
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [customTemplateStatus, setCustomTemplateStatus] = useState("");

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/template/${template.id}`;
  const canStart = isValidE164(phoneNumber) && consentConfirmed;
  const isCustomTemplate = template.id.startsWith("custom-");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("prankai.customTemplates") : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Template[];
      if (Array.isArray(parsed)) {
        setCustomTemplates(parsed.filter((item) => typeof item?.id === "string" && typeof item?.name === "string"));
      }
    } catch {
      setCustomTemplates([]);
    }
  }, []);

  useEffect(() => {
    if (!template) return;
    setCustomPrompt(template.defaultCustomPrompt ?? customPrompt);
    setHook(template.defaultHook ?? hook);
    setConfusion(template.defaultConfusion ?? confusion);
    setEscalation(template.defaultEscalation ?? escalation);
    setResolution(template.defaultResolution ?? resolution);
    setSilenceTimeout(template.defaultSilenceTimeout ?? silenceTimeout);
  }, [template?.id]);

  useEffect(() => {
    if (!templateList.length) return;
    if (!templateList.find((item) => item.id === templateId)) {
      setTemplateId(templateList[0].id);
    }
  }, [templateList, templateId]);

  const persistCustomTemplates = (items: Template[]) => {
    setCustomTemplates(items);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("prankai.customTemplates", JSON.stringify(items));
    }
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 32);

  const startCall = async () => {
    setStatus("");
    setCall(null);
    if (!canStart) {
      setStatus("Consent + valid E.164 number required.");
      return;
    }
    if (recordCall && jurisdiction !== "one-party" && !recordingConsent) {
      setStatus("Recording consent required for this jurisdiction.");
      return;
    }
    setLoading(true);
    try {
      const templatePayload = isCustomTemplate
        ? {
            id: template.id,
            name: template.name,
            systemPrompt: template.systemPrompt,
            firstMessage: template.firstMessage
          }
        : null;
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          template: templatePayload,
          culpritName,
          callerName,
          customPrompt,
          phoneNumber,
          recordCall,
          liveListen,
          hook,
          confusion,
          escalation,
          resolution,
          silenceTimeout
        })
      });
      const data = (await response.json()) as CallResponse;
      if (!response.ok) {
        setStatus(data.error || "Failed to start call.");
      } else {
        setCall(data);
        setStatus("Call started.");
      }
    } catch (err) {
      setStatus("Network error starting call.");
    } finally {
      setLoading(false);
    }
  };

  const runDryRun = async () => {
    setDryRunStatus("");
    setDryRunResponse("");
    setDryRunLoading(true);
    try {
      const templatePayload = isCustomTemplate
        ? {
            id: template.id,
            name: template.name,
            systemPrompt: template.systemPrompt,
            firstMessage: template.firstMessage
          }
        : null;
      const response = await fetch("/api/dry-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          template: templatePayload,
          culpritName,
          callerName,
          customPrompt,
          hook,
          confusion,
          escalation,
          resolution,
          silenceTimeout,
          userMessage: dryRunMessage
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setDryRunStatus(data.error || "Dry-run failed.");
      } else {
        setDryRunResponse(data.content || "");
        setDryRunStatus("Dry-run complete.");
      }
    } catch (err) {
      setDryRunStatus("Network error running dry-run.");
    } finally {
      setDryRunLoading(false);
    }
  };

  const saveCustomTemplate = () => {
    const name = customTemplateName.trim();
    if (!name) {
      setCustomTemplateStatus("Enter a template name.");
      return;
    }
    const id = `custom-${slugify(name) || "template"}-${Date.now()}`;
    const newTemplate: Template = {
      id,
      name,
      tagline: "Custom template (saved locally).",
      systemPrompt: template.systemPrompt,
      firstMessage: template.firstMessage,
      defaultCustomPrompt: customPrompt,
      defaultHook: hook,
      defaultConfusion: confusion,
      defaultEscalation: escalation,
      defaultResolution: resolution,
      defaultSilenceTimeout: silenceTimeout
    };
    const updated = [...customTemplates, newTemplate];
    persistCustomTemplates(updated);
    setTemplateId(id);
    setCustomTemplateName("");
    setCustomTemplateStatus("Template saved.");
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-tag">Prank Palz Studio</div>
          <h1>Prank Dial AI</h1>
          <p className="hero-subtitle">
            Design playful calls, remix voice templates, and track what makes the laughs land.
          </p>
          <div className="hero-tags">
            <span>Instant scripts</span>
            <span>Shareable templates</span>
            <span>Live listen</span>
          </div>
        </div>
        <div className="hero-art">
          <img src="/images/pranked.png" alt="Prank Palz illustration" />
        </div>
      </section>

      <section className="feature-highlight">
        <div>
          <p className="feature-kicker">New drop</p>
          <h2>67 prank templates, ready to remix.</h2>
          <p className="feature-body">
            Pick a tone, tweak the hook, and ship a call in minutes. Every template comes with a tested opener,
            escalation path, and clean wrap-up so your prank stays funny and in-bounds.
          </p>
          <div className="feature-stats">
            <div>
              <strong>67</strong>
              <span>Templates live</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Story beats</span>
            </div>
            <div>
              <strong>1</strong>
              <span>Click to share</span>
            </div>
          </div>
        </div>
        <div className="feature-image">
          <img src="/images/Untitled (Logo) (6).png" alt="67 prank templates highlight" />
        </div>
        <div className="feature-panel">
          <h3>What’s inside</h3>
          <ul>
            <li>Workplace mix-ups, delivery errors, and friendly mix-and-match scripts.</li>
            <li>Soft escalations that stay playful instead of aggressive.</li>
            <li>Built-in safety checks for consent and recording.</li>
          </ul>
        </div>
      </section>

      <section className="card grid" style={{ gap: 16 }}>
        <div className="grid grid-2">
          <div>
            <div className="label">Template</div>
            <select className="select" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {templateList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="muted">{template.tagline}</p>
          </div>
          <div>
            <div className="label">Share URL</div>
            {isCustomTemplate ? <p className="muted">Custom templates are stored locally.</p> : <CopyLink value={shareUrl} />}
          </div>
        </div>
        <div className="grid grid-2">
          <div>
            <div className="label">Save as custom template</div>
            <input
              className="input"
              value={customTemplateName}
              onChange={(e) => setCustomTemplateName(e.target.value)}
              placeholder="Name your template"
            />
          </div>
          <div className="grid" style={{ alignContent: "end" }}>
            <button className="btn" onClick={saveCustomTemplate}>
              Save template
            </button>
            {customTemplateStatus && <p className="muted">{customTemplateStatus}</p>}
          </div>
        </div>
      </section>

      <section className="card grid" style={{ gap: 16 }}>
        <div className="grid grid-2">
          <div>
            <div className="label">Culprit name</div>
            <input className="input" value={culpritName} onChange={(e) => setCulpritName(e.target.value)} />
          </div>
          <div>
            <div className="label">Caller persona</div>
            <input className="input" value={callerName} onChange={(e) => setCallerName(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="label">Custom prompt</div>
          <textarea className="textarea" rows={3} value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} />
        </div>
      </section>

      <section className="card grid" style={{ gap: 16 }}>
        <div className="section-title">Consent & Safety</div>
        <label className="muted">
          <input type="checkbox" checked={consentConfirmed} onChange={(e) => setConsentConfirmed(e.target.checked)} /> I have consent to place
          this call and record it where required by law.
        </label>
        <div className="grid grid-2">
          <div>
            <div className="label">Jurisdiction</div>
            <select className="select" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
              <option value="one-party">One-party consent</option>
              <option value="two-party">Two-party consent</option>
              <option value="not-sure">Not sure</option>
            </select>
          </div>
          <div>
            <label className="muted">
              <input type="checkbox" checked={recordingConsent} onChange={(e) => setRecordingConsent(e.target.checked)} /> I have explicit
              consent to record.
            </label>
          </div>
        </div>
      </section>

      <section className="card grid" style={{ gap: 16 }}>
        <div className="section-title">Conversation Program</div>
        <div className="grid grid-2">
          <div>
            <div className="label">Hook</div>
            <textarea className="textarea" rows={2} value={hook} onChange={(e) => setHook(e.target.value)} />
          </div>
          <div>
            <div className="label">Confusion</div>
            <textarea className="textarea" rows={2} value={confusion} onChange={(e) => setConfusion(e.target.value)} />
          </div>
          <div>
            <div className="label">Escalation</div>
            <textarea className="textarea" rows={2} value={escalation} onChange={(e) => setEscalation(e.target.value)} />
          </div>
          <div>
            <div className="label">Resolution</div>
            <textarea className="textarea" rows={2} value={resolution} onChange={(e) => setResolution(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="label">Silence timeout (seconds)</div>
          <input
            className="input"
            type="number"
            min={3}
            max={20}
            value={silenceTimeout}
            onChange={(e) => setSilenceTimeout(Number(e.target.value))}
          />
        </div>
      </section>

      <section className="card grid" style={{ gap: 12 }}>
        <div className="section-title">Dry-run chat (text)</div>
        <div>
          <div className="label">User reply</div>
          <input className="input" value={dryRunMessage} onChange={(e) => setDryRunMessage(e.target.value)} />
        </div>
        <button className="btn" onClick={runDryRun} disabled={dryRunLoading}>
          {dryRunLoading ? "Running..." : "Run dry-run"}
        </button>
        {dryRunStatus && <p className="muted">{dryRunStatus}</p>}
        {dryRunResponse && (
          <div>
            <div className="label">Assistant reply</div>
            <textarea className="textarea" rows={6} readOnly value={dryRunResponse} />
          </div>
        )}
      </section>

      <section className="card grid" style={{ gap: 12 }}>
        <div className="section-title">Make a call</div>
        <div>
          <div className="label">Phone number (E.164)</div>
          <input className="input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <label className="muted">
          <input type="checkbox" checked={recordCall} onChange={(e) => setRecordCall(e.target.checked)} /> Record this call
        </label>
        <label className="muted">
          <input type="checkbox" checked={liveListen} onChange={(e) => setLiveListen(e.target.checked)} /> Enable live listen
        </label>
        <button className="btn" onClick={startCall} disabled={!canStart || loading}>
          {loading ? "Starting..." : "Start AI Call"}
        </button>
        {status && <p className="muted">{status}</p>}
        {call?.monitor?.listenUrl && (
          <a className="btn" href={call.monitor.listenUrl} target="_blank" rel="noreferrer">
            Open live listen
          </a>
        )}
      </section>
    </div>
  );
}
