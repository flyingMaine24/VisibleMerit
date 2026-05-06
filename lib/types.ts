export type PaymentStatus = "free_preview" | "checkout_started" | "paid" | "refunded";

export type GenerationStatus =
  | "draft"
  | "intake_started"
  | "intake_complete"
  | "role_recommendations_ready"
  | "preview_generated"
  | "checkout_started"
  | "paid"
  | "generating"
  | "generated"
  | "generation_failed"
  | "needs_review";

export type GenerationMode = "preview" | "full";

export type SectionAccessLevel = "preview" | "paid";

export type RewriteStatus = "requested" | "completed" | "rejected" | "failed";

export type IntakeAnswers = {
  currentRole: string;
  industry: string;
  normalDay: string;
  problemsSolved: string;
  toolsUsed: string;
  communicatesWith: string;
  proofMoment: string;
  targetRoles: string;
  avoidWork: string;
};

export type RolePreference = {
  id: string;
  rawIntent: string;
  targetRoleIdeas: string[];
  workToAvoid: string;
};

export type RoleRecommendation = {
  id: string;
  title: string;
  lane: string;
  confidence: "strong" | "good" | "needs_detail";
  whyItFits: string[];
  likelyGaps: string[];
};

export type QualityState = "Strong" | "Good" | "Needs detail";

export type QualityRubric = {
  plainLanguage: QualityState;
  credible: QualityState;
  specific: QualityState;
  evidenceSupported: QualityState;
};

export type EvidenceWarning = {
  section: string;
  message: string;
  severity: "info" | "warning" | "blocked";
};

export type PackSection = {
  id: string;
  type: "skills" | "summary" | "bullets" | "linkedin" | "stories" | "plan";
  title: string;
  content: string;
  accessLevel: SectionAccessLevel;
  before?: string;
  whyItWorks?: string;
  evidenceWarnings: EvidenceWarning[];
};

export type Pack = {
  id: string;
  userId: string;
  email: string;
  paymentStatus: PaymentStatus;
  generationStatus: GenerationStatus;
  generationMode: GenerationMode;
  qualityRubric: QualityRubric;
  intake?: IntakeAnswers;
  rolePreference?: RolePreference;
  roleRecommendations: RoleRecommendation[];
  selectedRoleTargetIds: string[];
  sections: PackSection[];
  previewGenerationCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsEvent = {
  eventName: string;
  packId?: string;
  userId?: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
};
