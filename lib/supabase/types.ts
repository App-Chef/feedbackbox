// Mirrors `supabase gen types typescript` output for supabase/migrations.
// Regenerate with: npx supabase gen types typescript --linked > lib/supabase/types.ts

import type { FeedbackStatus, FeedbackType } from "@/lib/constants";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string | null; created_at: string };
        Insert: { id: string; email?: string | null; created_at?: string };
        Update: { email?: string | null };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          widget_config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          description?: string | null;
          widget_config?: Json;
        };
        Update: {
          name?: string;
          description?: string | null;
          widget_config?: Json;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          project_id: string;
          message: string;
          type: FeedbackType;
          status: FeedbackStatus;
          email: string | null;
          page_url: string | null;
          browser: string | null;
          os: string | null;
          screen_width: number | null;
          screen_height: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: { status?: FeedbackStatus };
        Relationships: [
          {
            foreignKeyName: "feedback_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      project_feedback_counts: {
        Row: {
          project_id: string;
          total: number;
          open: number;
          in_progress: number;
          resolved: number;
          archived: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_widget_config: {
        Args: { p_project_id: string };
        Returns: Json;
      };
      submit_feedback: {
        Args: {
          p_project_id: string;
          p_message: string;
          p_type: string;
          p_email?: string | null;
          p_page_url?: string | null;
          p_browser?: string | null;
          p_os?: string | null;
          p_screen_width?: number | null;
          p_screen_height?: number | null;
          p_client_key?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Feedback = Database["public"]["Tables"]["feedback"]["Row"];
export type FeedbackCounts = Database["public"]["Views"]["project_feedback_counts"]["Row"];
