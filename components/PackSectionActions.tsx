"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  label?: string;
  text: string;
};

export function PackSectionActions({ label = "section", text }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className="ghost" onClick={copyText} type="button">
      <Copy size={16} aria-hidden="true" /> {copied ? "Copied" : `Copy ${label}`}
    </button>
  );
}
