import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsEvent, IntakeAnswers, Pack } from "@/lib/types";
import type { VisibleMeritRepository } from "@/lib/data/repository";

type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string;
          event_name: string;
          id: string;
          metadata: Record<string, string | number | boolean | null>;
          pack_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at: string;
          event_name: string;
          metadata: Record<string, string | number | boolean | null>;
          pack_id?: string | null;
          user_id?: string | null;
        };
      };
      packs: {
        Row: {
          created_at: string;
          data: Pack;
          email: string;
          id: string;
          owner_id: string | null;
          payment_status: Pack["paymentStatus"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at: string;
          data: Pack;
          email: string;
          id: string;
          owner_id?: string | null;
          payment_status: Pack["paymentStatus"];
          updated_at: string;
          user_id: string;
        };
        Update: {
          data: Pack;
          email: string;
          owner_id?: string | null;
          payment_status: Pack["paymentStatus"];
          updated_at: string;
          user_id: string;
        };
      };
    };
  };
};

type PackRow = Database["public"]["Tables"]["packs"]["Row"];

function now(): string {
  return new Date().toISOString();
}

function packFromRow(row: PackRow): Pack {
  return row.data;
}

function packToRow(pack: Pack): Database["public"]["Tables"]["packs"]["Insert"] {
  return {
    id: pack.id,
    user_id: pack.userId,
    email: pack.email,
    owner_id: null,
    payment_status: pack.paymentStatus,
    data: pack,
    created_at: pack.createdAt,
    updated_at: pack.updatedAt
  };
}

export function hasSupabaseConfig(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createSupabaseServerClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase repository requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export class SupabaseRepository implements VisibleMeritRepository {
  constructor(private readonly client: SupabaseClient = createSupabaseServerClient()) {}

  async createPack(email: string, intake: IntakeAnswers): Promise<Pack> {
    const timestamp = now();
    const id = `pack-${Date.now()}`;
    const pack: Pack = {
      id,
      userId: `user-${email.toLowerCase()}`,
      email,
      paymentStatus: "free_preview",
      generationStatus: "intake_complete",
      generationMode: "preview",
      qualityRubric: {
        plainLanguage: "Good",
        credible: "Good",
        specific: "Needs detail",
        evidenceSupported: "Good"
      },
      intake,
      roleRecommendations: [],
      selectedRoleTargetIds: [],
      sections: [],
      previewGenerationCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    return await this.savePack(pack);
  }

  async getAnalytics(): Promise<AnalyticsEvent[]> {
    const { data, error } = await this.client
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Database["public"]["Tables"]["analytics_events"]["Row"][]).map((event) => ({
      eventName: event.event_name,
      packId: event.pack_id ?? undefined,
      userId: event.user_id ?? undefined,
      metadata: event.metadata,
      createdAt: event.created_at
    }));
  }

  async getPack(id: string): Promise<Pack | undefined> {
    const { data, error } = await this.client.from("packs").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? packFromRow(data as PackRow) : undefined;
  }

  async listPacks(): Promise<Pack[]> {
    const { data, error } = await this.client.from("packs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PackRow[]).map(packFromRow);
  }

  async savePack(pack: Pack): Promise<Pack> {
    const updated = { ...pack, updatedAt: now() };
    const { error } = await this.client.from("packs").upsert(packToRow(updated) as never, { onConflict: "id" });
    if (error) throw error;
    return updated;
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const { error } = await this.client.from("analytics_events").insert({
      created_at: event.createdAt,
      event_name: event.eventName,
      metadata: event.metadata,
      pack_id: event.packId ?? null,
      user_id: event.userId ?? null
    } as never);
    if (error) throw error;
  }
}
