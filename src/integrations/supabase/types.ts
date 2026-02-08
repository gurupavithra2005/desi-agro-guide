export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          content: string
          created_at: string
          id: string
          is_voice_input: boolean | null
          language: string | null
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_voice_input?: boolean | null
          language?: string | null
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_voice_input?: boolean | null
          language?: string | null
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      crop_calendar_events: {
        Row: {
          completed_at: string | null
          created_at: string
          crop_id: string | null
          description: string | null
          event_type: string
          field_id: string | null
          id: string
          is_completed: boolean | null
          reminder_days_before: number | null
          scheduled_date: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          crop_id?: string | null
          description?: string | null
          event_type: string
          field_id?: string | null
          id?: string
          is_completed?: boolean | null
          reminder_days_before?: number | null
          scheduled_date: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          crop_id?: string | null
          description?: string | null
          event_type?: string
          field_id?: string | null
          id?: string
          is_completed?: boolean | null
          reminder_days_before?: number | null
          scheduled_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_calendar_events_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_calendar_events_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "farmer_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          category: string | null
          created_at: string
          growth_duration_days: number | null
          icon_name: string | null
          id: string
          name_bn: string | null
          name_en: string
          name_hi: string | null
          name_kn: string | null
          name_mr: string | null
          name_pa: string | null
          name_ta: string | null
          name_te: string | null
          scientific_name: string | null
          season: string[] | null
          suitable_land_types: Database["public"]["Enums"]["land_type"][] | null
          water_requirement: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          growth_duration_days?: number | null
          icon_name?: string | null
          id?: string
          name_bn?: string | null
          name_en: string
          name_hi?: string | null
          name_kn?: string | null
          name_mr?: string | null
          name_pa?: string | null
          name_ta?: string | null
          name_te?: string | null
          scientific_name?: string | null
          season?: string[] | null
          suitable_land_types?:
            | Database["public"]["Enums"]["land_type"][]
            | null
          water_requirement?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          growth_duration_days?: number | null
          icon_name?: string | null
          id?: string
          name_bn?: string | null
          name_en?: string
          name_hi?: string | null
          name_kn?: string | null
          name_mr?: string | null
          name_pa?: string | null
          name_ta?: string | null
          name_te?: string | null
          scientific_name?: string | null
          season?: string[] | null
          suitable_land_types?:
            | Database["public"]["Enums"]["land_type"][]
            | null
          water_requirement?: string | null
        }
        Relationships: []
      }
      farmer_fields: {
        Row: {
          area_acres: number | null
          created_at: string
          current_crop_id: string | null
          field_name: string
          id: string
          irrigation_type: string | null
          land_type: Database["public"]["Enums"]["land_type"] | null
          latitude: number | null
          longitude: number | null
          soil_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_acres?: number | null
          created_at?: string
          current_crop_id?: string | null
          field_name: string
          id?: string
          irrigation_type?: string | null
          land_type?: Database["public"]["Enums"]["land_type"] | null
          latitude?: number | null
          longitude?: number | null
          soil_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_acres?: number | null
          created_at?: string
          current_crop_id?: string | null
          field_name?: string
          id?: string
          irrigation_type?: string | null
          land_type?: Database["public"]["Enums"]["land_type"] | null
          latitude?: number | null
          longitude?: number | null
          soil_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farmer_fields_current_crop_id_fkey"
            columns: ["current_crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      fertilizer_recommendations: {
        Row: {
          application_method: string | null
          created_at: string
          crop_id: string | null
          growth_stage: string | null
          id: string
          k_recommendation_kg_per_ha: number | null
          n_recommendation_kg_per_ha: number | null
          notes_en: string | null
          notes_hi: string | null
          p_recommendation_kg_per_ha: number | null
          soil_type: string | null
          timing_days_after_sowing: number | null
        }
        Insert: {
          application_method?: string | null
          created_at?: string
          crop_id?: string | null
          growth_stage?: string | null
          id?: string
          k_recommendation_kg_per_ha?: number | null
          n_recommendation_kg_per_ha?: number | null
          notes_en?: string | null
          notes_hi?: string | null
          p_recommendation_kg_per_ha?: number | null
          soil_type?: string | null
          timing_days_after_sowing?: number | null
        }
        Update: {
          application_method?: string | null
          created_at?: string
          crop_id?: string | null
          growth_stage?: string | null
          id?: string
          k_recommendation_kg_per_ha?: number | null
          n_recommendation_kg_per_ha?: number | null
          notes_en?: string | null
          notes_hi?: string | null
          p_recommendation_kg_per_ha?: number | null
          soil_type?: string | null
          timing_days_after_sowing?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fertilizer_recommendations_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string
          crop_id: string | null
          id: string
          image_urls: string[] | null
          is_answered: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string
          upvotes: number | null
          user_id: string
          views: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          crop_id?: string | null
          id?: string
          image_urls?: string[] | null
          is_answered?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
          views?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          crop_id?: string | null
          id?: string
          image_urls?: string[] | null
          is_answered?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_best_answer: boolean | null
          is_officer_reply: boolean | null
          post_id: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_best_answer?: boolean | null
          is_officer_reply?: boolean | null
          post_id?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_best_answer?: boolean | null
          is_officer_reply?: boolean | null
          post_id?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_upvotes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_upvotes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      government_schemes: {
        Row: {
          benefits: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          description_hi: string | null
          description_kn: string | null
          description_mr: string | null
          description_pa: string | null
          description_ta: string | null
          description_te: string | null
          eligibility: string | null
          helpline: string | null
          how_to_apply: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name_bn: string | null
          name_en: string
          name_hi: string | null
          name_kn: string | null
          name_mr: string | null
          name_pa: string | null
          name_ta: string | null
          name_te: string | null
          scheme_code: string
          scheme_type: string
          state: string | null
          website_url: string | null
        }
        Insert: {
          benefits?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          description_hi?: string | null
          description_kn?: string | null
          description_mr?: string | null
          description_pa?: string | null
          description_ta?: string | null
          description_te?: string | null
          eligibility?: string | null
          helpline?: string | null
          how_to_apply?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name_bn?: string | null
          name_en: string
          name_hi?: string | null
          name_kn?: string | null
          name_mr?: string | null
          name_pa?: string | null
          name_ta?: string | null
          name_te?: string | null
          scheme_code: string
          scheme_type: string
          state?: string | null
          website_url?: string | null
        }
        Update: {
          benefits?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          description_hi?: string | null
          description_kn?: string | null
          description_mr?: string | null
          description_pa?: string | null
          description_ta?: string | null
          description_te?: string | null
          eligibility?: string | null
          helpline?: string | null
          how_to_apply?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name_bn?: string | null
          name_en?: string
          name_hi?: string | null
          name_kn?: string | null
          name_mr?: string | null
          name_pa?: string | null
          name_ta?: string | null
          name_te?: string | null
          scheme_code?: string
          scheme_type?: string
          state?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          change_percent: number | null
          created_at: string
          crop_id: string | null
          crop_name: string
          district: string | null
          id: string
          market_name: string
          max_price: number
          min_price: number
          modal_price: number
          previous_price: number | null
          price_date: string
          state: string
          unit: string | null
        }
        Insert: {
          change_percent?: number | null
          created_at?: string
          crop_id?: string | null
          crop_name: string
          district?: string | null
          id?: string
          market_name: string
          max_price: number
          min_price: number
          modal_price: number
          previous_price?: number | null
          price_date?: string
          state: string
          unit?: string | null
        }
        Update: {
          change_percent?: number | null
          created_at?: string
          crop_id?: string | null
          crop_name?: string
          district?: string | null
          id?: string
          market_name?: string
          max_price?: number
          min_price?: number
          modal_price?: number
          previous_price?: number | null
          price_date?: string
          state?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pest_detections: {
        Row: {
          ai_response: Json | null
          confidence_score: number | null
          created_at: string
          detected_pest: string | null
          field_id: string | null
          id: string
          image_url: string | null
          severity: string | null
          treatment_recommendation: string | null
          user_id: string
        }
        Insert: {
          ai_response?: Json | null
          confidence_score?: number | null
          created_at?: string
          detected_pest?: string | null
          field_id?: string | null
          id?: string
          image_url?: string | null
          severity?: string | null
          treatment_recommendation?: string | null
          user_id: string
        }
        Update: {
          ai_response?: Json | null
          confidence_score?: number | null
          created_at?: string
          detected_pest?: string | null
          field_id?: string | null
          id?: string
          image_url?: string | null
          severity?: string | null
          treatment_recommendation?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pest_detections_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "farmer_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          alert_type: string
          created_at: string
          crop_name: string
          id: string
          is_active: boolean | null
          target_price: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          crop_name: string
          id?: string
          is_active?: boolean | null
          target_price: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          crop_name?: string
          id?: string
          is_active?: boolean | null
          target_price?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          district: string | null
          full_name: string | null
          id: string
          irrigation_type: string | null
          land_size_acres: number | null
          land_type: Database["public"]["Enums"]["land_type"] | null
          latitude: number | null
          longitude: number | null
          phone_number: string | null
          preferred_language: Database["public"]["Enums"]["app_language"] | null
          state: string | null
          updated_at: string
          user_id: string
          village: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          full_name?: string | null
          id?: string
          irrigation_type?: string | null
          land_size_acres?: number | null
          land_type?: Database["public"]["Enums"]["land_type"] | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["app_language"]
            | null
          state?: string | null
          updated_at?: string
          user_id: string
          village?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          full_name?: string | null
          id?: string
          irrigation_type?: string | null
          land_size_acres?: number | null
          land_type?: Database["public"]["Enums"]["land_type"] | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["app_language"]
            | null
          state?: string | null
          updated_at?: string
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      soil_tests: {
        Row: {
          created_at: string
          field_id: string
          id: string
          nitrogen_kg_per_ha: number | null
          organic_carbon_percent: number | null
          ph_level: number | null
          phosphorus_kg_per_ha: number | null
          potassium_kg_per_ha: number | null
          report_image_url: string | null
          test_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          field_id: string
          id?: string
          nitrogen_kg_per_ha?: number | null
          organic_carbon_percent?: number | null
          ph_level?: number | null
          phosphorus_kg_per_ha?: number | null
          potassium_kg_per_ha?: number | null
          report_image_url?: string | null
          test_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          field_id?: string
          id?: string
          nitrogen_kg_per_ha?: number | null
          organic_carbon_percent?: number | null
          ph_level?: number | null
          phosphorus_kg_per_ha?: number | null
          potassium_kg_per_ha?: number | null
          report_image_url?: string | null
          test_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "soil_tests_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "farmer_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_language: "en" | "hi" | "ta" | "te" | "kn" | "bn" | "pa" | "mr"
      app_role: "farmer" | "officer" | "admin"
      land_type: "dry" | "wet" | "garden"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_language: ["en", "hi", "ta", "te", "kn", "bn", "pa", "mr"],
      app_role: ["farmer", "officer", "admin"],
      land_type: ["dry", "wet", "garden"],
    },
  },
} as const
