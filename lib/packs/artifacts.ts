import type { PackSection } from "@/lib/types";

type ArtifactMeta = {
  label: string;
  use: string;
  exportName: string;
};

const artifactMetaByType: Record<PackSection["type"], ArtifactMeta> = {
  skills: {
    label: "Translation sample",
    use: "Use when you need a quick plain-language version of the work.",
    exportName: "Translated skill"
  },
  summary: {
    label: "Resume-ready",
    use: "Paste near the top of a resume, then adjust for a specific posting.",
    exportName: "Resume summary"
  },
  bullets: {
    label: "Resume-ready",
    use: "Choose the strongest four to six bullets for the role you are applying to.",
    exportName: "Resume bullets"
  },
  linkedin: {
    label: "Profile-ready",
    use: "Use as a starting point for your headline and About section.",
    exportName: "LinkedIn headline and About"
  },
  stories: {
    label: "Interview prep",
    use: "Practice these out loud and add numbers or details where you can.",
    exportName: "Interview stories"
  },
  gaps: {
    label: "Proof builder",
    use: "Use this as the checklist before applying or rewriting a section.",
    exportName: "Skills gap checklist"
  },
  plan: {
    label: "Action plan",
    use: "Use this to turn the pack into weekly movement instead of static copy.",
    exportName: "30-day move-up plan"
  }
};

export function getArtifactMeta(section: PackSection): ArtifactMeta {
  return artifactMetaByType[section.type];
}
