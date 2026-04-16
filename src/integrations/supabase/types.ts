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
      flashcards: {
        Row: {
          created_at: string
          ease_factor: number
          id: string
          image_url: string | null
          interval_days: number
          japanese: string
          last_reviewed_at: string | null
          lesson_id: string
          meaning: string
          next_review_at: string
          reading: string
          repetitions: number
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          id?: string
          image_url?: string | null
          interval_days?: number
          japanese: string
          last_reviewed_at?: string | null
          lesson_id: string
          meaning: string
          next_review_at?: string
          reading: string
          repetitions?: number
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          id?: string
          image_url?: string | null
          interval_days?: number
          japanese?: string
          last_reviewed_at?: string | null
          lesson_id?: string
          meaning?: string
          next_review_at?: string
          reading?: string
          repetitions?: number
          user_id?: string
        }
        Relationships: []
      }
      jlpt_questions: {
        Row: {
          correct_index: number
          created_at: string
          explanation: string
          id: string
          level: string
          options: Json
          passage_jp: string | null
          question_jp: string
          section: string
        }
        Insert: {
          correct_index: number
          created_at?: string
          explanation: string
          id?: string
          level: string
          options: Json
          passage_jp?: string | null
          question_jp: string
          section: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          explanation?: string
          id?: string
          level?: string
          options?: Json
          passage_jp?: string | null
          question_jp?: string
          section?: string
        }
        Relationships: []
      }
      jlpt_sessions: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          level: string
          mode: string
          total_questions: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          id?: string
          level: string
          mode: string
          total_questions?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          level?: string
          mode?: string
          total_questions?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      kitsune_tales: {
        Row: {
          completed: boolean
          correct_index: number
          created_at: string
          cultural_note: string | null
          id: string
          options: Json
          question: string
          story_furigana: string | null
          story_jp: string
          tale_date: string
          theme: string | null
          title: string | null
          translation: string
          user_id: string
          vocab_used: Json | null
          xp_awarded: number
        }
        Insert: {
          completed?: boolean
          correct_index: number
          created_at?: string
          cultural_note?: string | null
          id?: string
          options: Json
          question: string
          story_furigana?: string | null
          story_jp: string
          tale_date?: string
          theme?: string | null
          title?: string | null
          translation: string
          user_id: string
          vocab_used?: Json | null
          xp_awarded?: number
        }
        Update: {
          completed?: boolean
          correct_index?: number
          created_at?: string
          cultural_note?: string | null
          id?: string
          options?: Json
          question?: string
          story_furigana?: string | null
          story_jp?: string
          tale_date?: string
          theme?: string | null
          title?: string | null
          translation?: string
          user_id?: string
          vocab_used?: Json | null
          xp_awarded?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          best_score: number | null
          completed: boolean
          id: string
          lesson_id: string
          section: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: number | null
          completed?: boolean
          id?: string
          lesson_id: string
          section?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: number | null
          completed?: boolean
          id?: string
          lesson_id?: string
          section?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mistake_log: {
        Row: {
          id: string
          lesson_id: string
          mistake_count: number
          updated_at: string
          user_id: string
          word: string
        }
        Insert: {
          id?: string
          lesson_id: string
          mistake_count?: number
          updated_at?: string
          user_id: string
          word: string
        }
        Update: {
          id?: string
          lesson_id?: string
          mistake_count?: number
          updated_at?: string
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      nhk_news_cache: {
        Row: {
          audio_url: string | null
          body_html: string | null
          fetched_at: string
          id: string
          level: string
          news_id: string
          published_at: string | null
          source: string
          source_url: string
          summary: string | null
          title: string
        }
        Insert: {
          audio_url?: string | null
          body_html?: string | null
          fetched_at?: string
          id?: string
          level: string
          news_id: string
          published_at?: string | null
          source: string
          source_url: string
          summary?: string | null
          title: string
        }
        Update: {
          audio_url?: string | null
          body_html?: string | null
          fetched_at?: string
          id?: string
          level?: string
          news_id?: string
          published_at?: string | null
          source?: string
          source_url?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      personal_badges: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          myth: string | null
          rarity: string
          tier: number
          title: string
          title_jp: string | null
          trigger_detail: string
          trigger_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          myth?: string | null
          rarity?: string
          tier?: number
          title: string
          title_jp?: string | null
          trigger_detail: string
          trigger_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          myth?: string | null
          rarity?: string
          tier?: number
          title?: string
          title_jp?: string | null
          trigger_detail?: string
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      placement_results: {
        Row: {
          created_at: string
          grammar_score: number
          id: string
          level: string
          listening_score: number
          reading_score: number
          score: number
          total_questions: number
          unlocked_up_to: number
          user_id: string
          vocab_score: number
        }
        Insert: {
          created_at?: string
          grammar_score?: number
          id?: string
          level?: string
          listening_score?: number
          reading_score?: number
          score?: number
          total_questions?: number
          unlocked_up_to?: number
          user_id: string
          vocab_score?: number
        }
        Update: {
          created_at?: string
          grammar_score?: number
          id?: string
          level?: string
          listening_score?: number
          reading_score?: number
          score?: number
          total_questions?: number
          unlocked_up_to?: number
          user_id?: string
          vocab_score?: number
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          created_at: string
          id: string
          practice_type: string
          score_close: number
          score_missed: number
          score_perfect: number
          total_items: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          id?: string
          practice_type?: string
          score_close?: number
          score_missed?: number
          score_perfect?: number
          total_items?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          id?: string
          practice_type?: string
          score_close?: number
          score_missed?: number
          score_perfect?: number
          total_items?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          id: string
          last_study_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_study_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_study_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_study_session: { Args: { p_user_id: string }; Returns: undefined }
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
