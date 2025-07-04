export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcement_categories: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          label: string
          modified_at: string | null
          modified_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          id?: string
          label: string
          modified_at?: string | null
          modified_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          label?: string
          modified_at?: string | null
          modified_by?: string | null
        }
        Relationships: []
      }
      announcement_category_map: {
        Row: {
          announcement_id: string
          category_id: string
          created_at: string
          created_by: string
          modified_at: string | null
          modified_by: string | null
        }
        Insert: {
          announcement_id: string
          category_id: string
          created_at?: string
          created_by: string
          modified_at?: string | null
          modified_by?: string | null
        }
        Update: {
          announcement_id?: string
          category_id?: string
          created_at?: string
          created_by?: string
          modified_at?: string | null
          modified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_category_map_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_category_map_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "announcement_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          modified_at: string | null
          modified_by: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          modified_at?: string | null
          modified_by?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          modified_at?: string | null
          modified_by?: string | null
          title?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comment: string
          created_at: string
          created_by: string
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comment: string
          created_at?: string
          created_by: string
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string
          created_at?: string
          created_by?: string
          id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      news_events: {
        Row: {
          content: string
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          end_date: string | null
          id: string
          modified_at: string | null
          modified_by: string | null
          start_date: string | null
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          id?: string
          modified_at?: string | null
          modified_by?: string | null
          start_date?: string | null
          title: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          id?: string
          modified_at?: string | null
          modified_by?: string | null
          start_date?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          created_by: string
          email: string
          id: string
          is_active: boolean | null
          modified_at: string | null
          modified_by: string | null
          name: string
          password: string | null
          phone: string
          role: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          id?: string
          is_active?: boolean | null
          modified_at?: string | null
          modified_by?: string | null
          name: string
          password?: string | null
          phone: string
          role?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          id?: string
          is_active?: boolean | null
          modified_at?: string | null
          modified_by?: string | null
          name?: string
          password?: string | null
          phone?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
