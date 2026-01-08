"use client";

import { useState } from "react";

export default function CopyLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr auto", gap: 8 }}>
      <input className="input" value={value} readOnly />
      <button className="btn" onClick={onCopy} type="button">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
