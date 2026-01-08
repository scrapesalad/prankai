"use client";

import { useMemo, useState } from "react";
import { templates, templateById } from "../lib/templates";
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
  const template = useMemo(() => templateById[templateId] || templates[0], [templateId]);

  const [culpritName, setCulpritName] = useState("Chris");
  const [callerName, setCallerName] = useState("Sterling");
  const [customPrompt, setCustomPrompt] = useState(
    \"Keep the tone playful but believable. If they ask who this is, restate your name calmly.\"
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recordCall, setRecordCall] = useState(true);
  const [liveListen, setLiveListen] = useState(true);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("not-sure");
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [hook, setHook] = useState(\"Open with a friendly, specific reason for the call.\");
  const [confusion, setConfusion] = useState(\"Introduce a small, believable confusion that needs clarification.\");
  const [escalation, setEscalation] = useState(\"Increase urgency just a bit, but keep it light and non-threatening.\");
  const [resolution, setResolution] = useState(\"Offer a simple resolution and end politely if they seem done.\");
  const [silenceTimeout, setSilenceTimeout] = useState(8);
  const [status, setStatus] = useState<string>("");
  const [call, setCall] = useState<CallResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/template/${template.id}`;
  const canStart = isValidE164(phoneNumber) && consentConfirmed;

  const startCall = async () => {
    setStatus("");
    setCall(null);
    if (!canStart) {
      setStatus("Consent + valid E.164 number required.");
      return;
    }
    if (recordCall && jurisdiction !== \"one-party\" && !recordingConsent) {
      setStatus("Recording consent required for this jurisdiction.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/call", {
        method: \"POST\",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
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

  return (
    <div className="grid" style={{ gap: 24 }}>
      <header>
        <h1>Prank Dial AI</h1>
        <p className="muted">Design prank calls, share templates, and track what performs best.</p>
      </header>

      <section className="card grid" style={{ gap: 16 }}>
        <div className="grid grid-2">
          <div>
            <div className="label">Template</div>
            <select className="select" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="muted">{template.tagline}</p>
          </div>
          <div>
            <div className="label">Share URL</div>
            <CopyLink value={shareUrl} />
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
          <input type=\"checkbox\" checked={consentConfirmed} onChange={(e) => setConsentConfirmed(e.target.checked)} /> I have consent to place
          this call and record it where required by law.
        </label>
        <div className="grid grid-2">
          <div>
            <div className="label">Jurisdiction</div>
            <select className="select" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
              <option value=\"one-party\">One-party consent</option>
              <option value=\"two-party\">Two-party consent</option>
              <option value=\"not-sure\">Not sure</option>
            </select>
          </div>
          <div>
            <label className="muted">
              <input type=\"checkbox\" checked={recordingConsent} onChange={(e) => setRecordingConsent(e.target.checked)} /> I have explicit
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
            type=\"number\"
            min={3}
            max={20}
            value={silenceTimeout}
            onChange={(e) => setSilenceTimeout(Number(e.target.value))}
          />
        </div>
      </section>

      <section className="card grid" style={{ gap: 12 }}>
        <div className="section-title">Make a call</div>
        <div>
          <div className="label">Phone number (E.164)</div>
          <input className="input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <label className="muted">
          <input type=\"checkbox\" checked={recordCall} onChange={(e) => setRecordCall(e.target.checked)} /> Record this call
        </label>
        <label className="muted">
          <input type=\"checkbox\" checked={liveListen} onChange={(e) => setLiveListen(e.target.checked)} /> Enable live listen
        </label>
        <button className="btn" onClick={startCall} disabled={!canStart || loading}>
          {loading ? \"Starting...\" : \"Start AI Call\"}
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
