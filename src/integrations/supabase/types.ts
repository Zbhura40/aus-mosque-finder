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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          feedback_text: string
          id: string
          is_read: boolean | null
          page_url: string | null
          resolved_at: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
          user_email: string | null
          user_name: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          feedback_text: string
          id?: string
          is_read?: boolean | null
          page_url?: string | null
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          feedback_text?: string
          id?: string
          is_read?: boolean | null
          page_url?: string | null
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      mosques: {
        Row: {
          address: string
          contact_info: Json | null
          facilities: Json | null
          facilities_json: Json | null
          last_updated: string | null
          latitude: number
          longitude: number
          mosque_id: string
          name: string
          phone: string | null
          platform_integration: string | null
          platform_mosque_id: string | null
        }
        Insert: {
          address: string
          contact_info?: Json | null
          facilities?: Json | null
          facilities_json?: Json | null
          last_updated?: string | null
          latitude: number
          longitude: number
          mosque_id: string
          name: string
          phone?: string | null
          platform_integration?: string | null
          platform_mosque_id?: string | null
        }
        Update: {
          address?: string
          contact_info?: Json | null
          facilities?: Json | null
          facilities_json?: Json | null
          last_updated?: string | null
          latitude?: number
          longitude?: number
          mosque_id?: string
          name?: string
          phone?: string | null
          platform_integration?: string | null
          platform_mosque_id?: string | null
        }
        Relationships: []
      }
      prayer_times: {
        Row: {
          admin_review_required: boolean | null
          asr_adhan: string | null
          asr_iqamah: string | null
          auto_scraped: boolean | null
          created_at: string | null
          data_freshness_score: number | null
          date: string
          dhuhr_adhan: string | null
          dhuhr_iqamah: string | null
          extraction_confidence: number | null
          facility_updates: Json | null
          fajr_adhan: string | null
          fajr_iqamah: string | null
          id: string
          is_current: boolean | null
          isha_adhan: string | null
          isha_iqamah: string | null
          jumah_times: Json | null
          last_scrape_attempt: string | null
          maghrib_adhan: string | null
          maghrib_iqamah: string | null
          mosque_id: string
          parsing_notes: string | null
          platform_source: string | null
          scrape_success: boolean | null
          scraped_at: string | null
          source_format: string | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          admin_review_required?: boolean | null
          asr_adhan?: string | null
          asr_iqamah?: string | null
          auto_scraped?: boolean | null
          created_at?: string | null
          data_freshness_score?: number | null
          date: string
          dhuhr_adhan?: string | null
          dhuhr_iqamah?: string | null
          extraction_confidence?: number | null
          facility_updates?: Json | null
          fajr_adhan?: string | null
          fajr_iqamah?: string | null
          id?: string
          is_current?: boolean | null
          isha_adhan?: string | null
          isha_iqamah?: string | null
          jumah_times?: Json | null
          last_scrape_attempt?: string | null
          maghrib_adhan?: string | null
          maghrib_iqamah?: string | null
          mosque_id: string
          parsing_notes?: string | null
          platform_source?: string | null
          scrape_success?: boolean | null
          scraped_at?: string | null
          source_format?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_review_required?: boolean | null
          asr_adhan?: string | null
          asr_iqamah?: string | null
          auto_scraped?: boolean | null
          created_at?: string | null
          data_freshness_score?: number | null
          date?: string
          dhuhr_adhan?: string | null
          dhuhr_iqamah?: string | null
          extraction_confidence?: number | null
          facility_updates?: Json | null
          fajr_adhan?: string | null
          fajr_iqamah?: string | null
          id?: string
          is_current?: boolean | null
          isha_adhan?: string | null
          isha_iqamah?: string | null
          jumah_times?: Json | null
          last_scrape_attempt?: string | null
          maghrib_adhan?: string | null
          maghrib_iqamah?: string | null
          mosque_id?: string
          parsing_notes?: string | null
          platform_source?: string | null
          scrape_success?: boolean | null
          scraped_at?: string | null
          source_format?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scrape_logs: {
        Row: {
          batch_size: number | null
          claude_api_calls: number | null
          cost_estimate: number | null
          created_by: string | null
          duration_seconds: number | null
          error_message: string | null
          google_api_calls: number | null
          halal_stores_found: number | null
          id: string
          new_stores_added: number | null
          region: string | null
          run_date: string | null
          status: string
          stores_updated: number | null
          supermarkets_found: number | null
          supermarkets_processed: number | null
        }
        Insert: {
          batch_size?: number | null
          claude_api_calls?: number | null
          cost_estimate?: number | null
          created_by?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          google_api_calls?: number | null
          halal_stores_found?: number | null
          id?: string
          new_stores_added?: number | null
          region?: string | null
          run_date?: string | null
          status: string
          stores_updated?: number | null
          supermarkets_found?: number | null
          supermarkets_processed?: number | null
        }
        Update: {
          batch_size?: number | null
          claude_api_calls?: number | null
          cost_estimate?: number | null
          created_by?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          google_api_calls?: number | null
          halal_stores_found?: number | null
          id?: string
          new_stores_added?: number | null
          region?: string | null
          run_date?: string | null
          status?: string
          stores_updated?: number | null
          supermarkets_found?: number | null
          supermarkets_processed?: number | null
        }
        Relationships: []
      }
      scraping_logs: {
        Row: {
          created_at: string
          error_message: string | null
          extraction_confidence: number | null
          id: string
          mosque_id: string
          raw_content_preview: string | null
          scrape_date: string
          source_format: string | null
          success: boolean
          times_found: Json | null
          website_url: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extraction_confidence?: number | null
          id?: string
          mosque_id: string
          raw_content_preview?: string | null
          scrape_date?: string
          source_format?: string | null
          success?: boolean
          times_found?: Json | null
          website_url: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extraction_confidence?: number | null
          id?: string
          mosque_id?: string
          raw_content_preview?: string | null
          scrape_date?: string
          source_format?: string | null
          success?: boolean
          times_found?: Json | null
          website_url?: string
        }
        Relationships: []
      }
      supermarkets: {
        Row: {
          address: string
          chain: string | null
          confidence_score: number | null
          created_at: string | null
          has_halal_section: boolean | null
          id: string
          is_active: boolean | null
          last_checked: string | null
          lat: number
          lng: number
          name: string
          place_id: string
          rating: number | null
          reasoning: string | null
          source: string | null
          updated_at: string | null
          user_ratings_total: number | null
        }
        Insert: {
          address: string
          chain?: string | null
          confidence_score?: number | null
          created_at?: string | null
          has_halal_section?: boolean | null
          id?: string
          is_active?: boolean | null
          last_checked?: string | null
          lat: number
          lng: number
          name: string
          place_id: string
          rating?: number | null
          reasoning?: string | null
          source?: string | null
          updated_at?: string | null
          user_ratings_total?: number | null
        }
        Update: {
          address?: string
          chain?: string | null
          confidence_score?: number | null
          created_at?: string | null
          has_halal_section?: boolean | null
          id?: string
          is_active?: boolean | null
          last_checked?: string | null
          lat?: number
          lng?: number
          name?: string
          place_id?: string
          rating?: number | null
          reasoning?: string | null
          source?: string | null
          updated_at?: string | null
          user_ratings_total?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      feedback_recent: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string | null
          is_read: boolean | null
          page_url: string | null
          status: string | null
          user_email: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string | null
          is_read?: boolean | null
          page_url?: string | null
          status?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string | null
          is_read?: boolean | null
          page_url?: string | null
          status?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      feedback_stats: {
        Row: {
          in_progress_count: number | null
          new_count: number | null
          resolved_count: number | null
          this_month: number | null
          this_week: number | null
          total_feedback: number | null
          unread_count: number | null
        }
        Relationships: []
      }
      feedback_unread: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string | null
          page_url: string | null
          status: string | null
          user_email: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string | null
          page_url?: string | null
          status?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string | null
          page_url?: string | null
          status?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      halal_supermarkets_verified: {
        Row: {
          address: string | null
          chain: string | null
          confidence_score: number | null
          id: string | null
          last_checked: string | null
          lat: number | null
          lng: number | null
          name: string | null
          place_id: string | null
          rating: number | null
          reasoning: string | null
          user_ratings_total: number | null
        }
        Insert: {
          address?: string | null
          chain?: string | null
          confidence_score?: number | null
          id?: string | null
          last_checked?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          place_id?: string | null
          rating?: number | null
          reasoning?: string | null
          user_ratings_total?: number | null
        }
        Update: {
          address?: string | null
          chain?: string | null
          confidence_score?: number | null
          id?: string | null
          last_checked?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          place_id?: string | null
          rating?: number | null
          reasoning?: string | null
          user_ratings_total?: number | null
        }
        Relationships: []
      }
      recent_scrape_stats: {
        Row: {
          claude_api_calls: number | null
          cost_estimate: number | null
          duration_seconds: number | null
          google_api_calls: number | null
          halal_stores_found: number | null
          new_stores_added: number | null
          region: string | null
          run_date: string | null
          status: string | null
          stores_updated: number | null
          supermarkets_found: number | null
          supermarkets_processed: number | null
        }
        Insert: {
          claude_api_calls?: number | null
          cost_estimate?: number | null
          duration_seconds?: number | null
          google_api_calls?: number | null
          halal_stores_found?: number | null
          new_stores_added?: number | null
          region?: string | null
          run_date?: string | null
          status?: string | null
          stores_updated?: number | null
          supermarkets_found?: number | null
          supermarkets_processed?: number | null
        }
        Update: {
          claude_api_calls?: number | null
          cost_estimate?: number | null
          duration_seconds?: number | null
          google_api_calls?: number | null
          halal_stores_found?: number | null
          new_stores_added?: number | null
          region?: string | null
          run_date?: string | null
          status?: string | null
          stores_updated?: number | null
          supermarkets_found?: number | null
          supermarkets_processed?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      flag_prayer_times_for_review: {
        Args: { p_confidence_threshold?: number; p_mosque_id: string }
        Returns: undefined
      }
      get_mosque_platform_status: {
        Args: { p_mosque_id: string }
        Returns: {
          avg_confidence: number
          last_successful_scrape: string
          mosque_id: string
          needs_review: boolean
          platform_integration: string
          platform_mosque_id: string
        }[]
      }
      get_mosques_needing_scrape: {
        Args: Record<PropertyKey, never>
        Returns: {
          days_since_scrape: number
          last_scrape: string
          mosque_id: string
          name: string
          website: string
        }[]
      }
      get_supermarkets_near: {
        Args: {
          halal_only?: boolean
          min_confidence?: number
          radius_km?: number
          search_lat: number
          search_lng: number
        }
        Returns: {
          address: string
          chain: string
          confidence_score: number
          distance_km: number
          has_halal_section: boolean
          id: string
          lat: number
          lng: number
          name: string
        }[]
      }
      mark_feedback_read: {
        Args: { feedback_id: string }
        Returns: undefined
      }
      update_feedback_status: {
        Args: { feedback_id: string; new_status: string }
        Returns: undefined
      }
      update_mosque_details: {
        Args: {
          p_contact_info?: Json
          p_facilities?: Json
          p_mosque_id: string
          p_platform_integration?: string
          p_platform_mosque_id?: string
        }
        Returns: undefined
      }
      update_prayer_times_currency: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
