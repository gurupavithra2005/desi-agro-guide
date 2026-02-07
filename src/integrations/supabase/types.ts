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
