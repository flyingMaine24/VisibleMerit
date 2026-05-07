"use client";

import { Copy, FileText, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import type { PackSection } from "@/lib/types";

type Props = {
  email: string;
  packTitle: string;
  sections: PackSection[];
};

function formatPack(packTitle: string, sections: PackSection[]): string {
  return [
    packTitle,
    "",
    ...sections.flatMap((section) => [
      section.title.toUpperCase(),
      section.before ? `Before: ${section.before}` : "",
      section.content,
      section.whyItWorks ? `Why it works: ${section.whyItWorks}` : "",
      ""
    ])
  ]
    .filter((line) => line !== "")
    .join("\n\n");
}

export function PackExportActions({ email, packTitle, sections }: Props) {
  const [copied, setCopied] = useState(false);
  const packText = useMemo(() => formatPack(packTitle, sections), [packTitle, sections]);
  const mailHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(packTitle)}&body=${encodeURIComponent(packText)}`;

  async function copyFullPack() {
    await navigator.clipboard.writeText(packText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="action-bar workspace-actions no-print">
      <button className="secondary" onClick={copyFullPack} type="button">
        <Copy size={16} aria-hidden="true" /> {copied ? "Copied pack" : "Copy full pack"}
      </button>
      <button className="secondary" onClick={() => window.print()} type="button">
        <FileText size={16} aria-hidden="true" /> Export PDF
      </button>
      <a className="button secondary" href={mailHref}>
        <Mail size={16} aria-hidden="true" /> Email pack
      </a>
    </div>
  );
}
