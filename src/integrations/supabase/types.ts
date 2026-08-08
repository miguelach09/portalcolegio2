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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admission_applications: {
        Row: {
          birth_date: string | null
          comments: string | null
          created_at: string
          grade: string
          guardian_email: string
          guardian_name: string
          guardian_phone: string
          id: string
          previous_school: string | null
          status: string
          student_name: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          comments?: string | null
          created_at?: string
          grade: string
          guardian_email: string
          guardian_name: string
          guardian_phone: string
          id?: string
          previous_school?: string | null
          status?: string
          student_name: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          comments?: string | null
          created_at?: string
          grade?: string
          guardian_email?: string
          guardian_name?: string
          guardian_phone?: string
          id?: string
          previous_school?: string | null
          status?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      circular_reads: {
        Row: {
          document_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          document_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          document_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circular_reads_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          grade: string | null
          id: string
          is_active: boolean
          published_at: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean
          published_at?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean
          published_at?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          location: string | null
          scheduled_at: string | null
          sort_order: number
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          scheduled_at?: string | null
          sort_order?: number
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          scheduled_at?: string | null
          sort_order?: number
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: Database["public"]["Enums"]["gallery_category"]
          created_at: string
          id: string
          image_path: string | null
          image_url: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["gallery_category"]
          created_at?: string
          id?: string
          image_path?: string | null
          image_url: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["gallery_category"]
          created_at?: string
          id?: string
          image_path?: string | null
          image_url?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      guardian_links: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          student_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          student_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          student_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          category: Database["public"]["Enums"]["news_category"]
          content: string | null
          created_at: string
          id: string
          image_path: string | null
          image_url: string | null
          is_active: boolean
          published_at: string
          scheduled_at: string | null
          sort_order: number
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["news_category"]
          content?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean
          published_at?: string
          scheduled_at?: string | null
          sort_order?: number
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["news_category"]
          content?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean
          published_at?: string
          scheduled_at?: string | null
          sort_order?: number
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      student_guardians: {
        Row: {
          created_at: string
          id: string
          relationship: string
          student_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          relationship?: string
          student_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relationship?: string
          student_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          full_name: string
          grade: string
          group_name: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          grade: string
          group_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          grade?: string
          group_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      survey_options: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
          survey_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          survey_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_options_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          survey_id: string
          voter_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          survey_id: string
          voter_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          survey_id?: string
          voter_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "survey_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_votes_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          question: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          area: string
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          photo_path: string | null
          photo_url: string | null
          role_title: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          area?: string
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          photo_path?: string | null
          photo_url?: string | null
          role_title?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          area?: string
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          photo_path?: string | null
          photo_url?: string | null
          role_title?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_guardian_of: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "familia"
      document_category:
        | "circulares"
        | "revisas"
        | "admisiones"
        | "herramientas"
        | "general"
        | "guias"
      gallery_category:
        | "aulas"
        | "deporte"
        | "arte"
        | "ciencia"
        | "biblioteca"
        | "instalaciones"
        | "eventos"
        | "graduacion"
      news_category:
        | "institucional"
        | "academico"
        | "deporte"
        | "arte"
        | "bienestar"
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
      app_role: ["admin", "editor", "familia"],
      document_category: [
        "circulares",
        "revisas",
        "admisiones",
        "herramientas",
        "general",
        "guias",
      ],
      gallery_category: [
        "aulas",
        "deporte",
        "arte",
        "ciencia",
        "biblioteca",
        "instalaciones",
        "eventos",
        "graduacion",
      ],
      news_category: [
        "institucional",
        "academico",
        "deporte",
        "arte",
        "bienestar",
      ],
    },
  },
} as const
