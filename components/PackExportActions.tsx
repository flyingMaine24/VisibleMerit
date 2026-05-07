"use client";

import { Copy, FileText, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import { getArtifactMeta } from "@/lib/packs/artifacts";
import type { PackSection } from "@/lib/types";

type Props = {
  email: string;
  packTitle: string;
  primaryLaneTitle?: string;
  sections: PackSection[];
};

function formatPack(packTitle: string, sections: PackSection[], primaryLaneTitle?: string): string {
  return [
    packTitle,
    primaryLaneTitle ? `Primary lane: ${primaryLaneTitle}` : "",
    `Exported: ${new Date().toLocaleDateString()}`,
    "",
    ...sections.flatMap((section) => [
      `${getArtifactMeta(section).exportName.toUpperCase()} - ${getArtifactMeta(section).label}`,
      `Recommended use: ${getArtifactMeta(section).use}`,
      section.before ? `Before: ${section.before}` : "",
      section.content,
      section.whyItWorks ? `Why it works: ${section.whyItWorks}` : "",
      ""
    ])
  ]
    .filter((line) => line !== "")
    .join("\n\n");
}

export function PackExportActions({ email, packTitle, primaryLaneTitle, sections }: Props) {
  const [copied, setCopied] = useState(false);
  const packText = useMemo(() => formatPack(packTitle, sections, primaryLaneTitle), [packTitle, primaryLaneTitle, sections]);
  const mailHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(packTitle)}&body=${encodeURIComponent(packText)}`;

  async function copyFullPack() {
    await navigator.clipboard.writeText(packText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="workspace-actions no-print" aria-label="Pack export actions">
      <div>
        <span>Export pack</span>
        <strong>Take the whole document with you.</strong>
        <p>Copy plain text for editing, print to PDF, or draft an email to yourself.</p>
      </div>
      <div className="action-bar">
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
    </section>
  );
}
