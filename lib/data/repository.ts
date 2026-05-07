import {
  createPack,
  getAnalytics,
  getPack,
  listPacks,
  savePack,
  trackEvent
} from "@/lib/store";
import type { AnalyticsEvent, IntakeAnswers, Pack } from "@/lib/types";

export type VisibleMeritRepository = {
  createPack(email: string, intake: IntakeAnswers): Pack;
  getAnalytics(): AnalyticsEvent[];
  getPack(id: string): Pack | undefined;
  listPacks(): Pack[];
  savePack(pack: Pack): Pack;
  trackEvent(event: AnalyticsEvent): void;
};

const localRepository: VisibleMeritRepository = {
  createPack,
  getAnalytics,
  getPack,
  listPacks,
  savePack,
  trackEvent
};

export function getRepository(): VisibleMeritRepository {
  return localRepository;
}
