import {
  createPack,
  getAnalytics,
  getPack,
  listPacks,
  savePack,
  trackEvent
} from "@/lib/store";
import { hasSupabaseConfig, SupabaseRepository } from "@/lib/data/supabase";
import type { AnalyticsEvent, IntakeAnswers, Pack } from "@/lib/types";

export type VisibleMeritRepository = {
  createPack(email: string, intake: IntakeAnswers): Promise<Pack>;
  getAnalytics(): Promise<AnalyticsEvent[]>;
  getPack(id: string): Promise<Pack | undefined>;
  listPacks(): Promise<Pack[]>;
  savePack(pack: Pack): Promise<Pack>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
};

const localRepository: VisibleMeritRepository = {
  async createPack(email, intake) {
    return createPack(email, intake);
  },
  async getAnalytics() {
    return getAnalytics();
  },
  async getPack(id) {
    return getPack(id);
  },
  async listPacks() {
    return listPacks();
  },
  async savePack(pack) {
    return savePack(pack);
  },
  async trackEvent(event) {
    trackEvent(event);
  }
};

export function getRepository(): VisibleMeritRepository {
  if (process.env.VISIBLE_MERIT_REPOSITORY === "supabase" || hasSupabaseConfig()) {
    return new SupabaseRepository();
  }

  return localRepository;
}
