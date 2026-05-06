import { z } from "zod";

export const qualityStateSchema = z.enum(["Strong", "Good", "Needs detail"]);

export const qualityRubricSchema = z.object({
  plainLanguage: qualityStateSchema,
  credible: qualityStateSchema,
  specific: qualityStateSchema,
  evidenceSupported: qualityStateSchema
});

export const evidenceWarningSchema = z.object({
  section: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(["info", "warning", "blocked"])
});

export const roleRecommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  lane: z.string().min(1),
  confidence: z.enum(["strong", "good", "needs_detail"]),
  whyItFits: z.array(z.string().min(1)).min(1),
  likelyGaps: z.array(z.string().min(1))
});

export const packSectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["skills", "summary", "bullets", "linkedin", "stories", "plan"]),
  title: z.string().min(1),
  content: z.string().min(1),
  accessLevel: z.enum(["preview", "paid"]),
  before: z.string().optional(),
  whyItWorks: z.string().optional(),
  evidenceWarnings: z.array(evidenceWarningSchema)
});

export const previewPackSchema = z.object({
  roleRecommendations: z.array(roleRecommendationSchema).min(1).max(5),
  sections: z.array(packSectionSchema).min(1),
  qualityRubric: qualityRubricSchema
});

export const fullPackSchema = previewPackSchema.extend({
  sections: z.array(packSectionSchema).min(6)
});

export type PreviewPackOutput = z.infer<typeof previewPackSchema>;
export type FullPackOutput = z.infer<typeof fullPackSchema>;
