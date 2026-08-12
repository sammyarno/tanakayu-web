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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      member_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          full_name: string
          id: string
          phone_number: string | null
          revoked_at: string | null
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          revoked_at?: string | null
          token: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          revoked_at?: string | null
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      member_waitlist: {
        Row: {
          address: string
          approved_user_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          invite_id: string | null
          phone_number: string
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["waitlist_status"]
          username: string
        }
        Insert: {
          address?: string
          approved_user_id?: string | null
          created_at?: string
          email: string
          full_name?: string
          id?: string
          invite_id?: string | null
          phone_number: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
          username: string
        }
        Update: {
          address?: string
          approved_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          invite_id?: string | null
          phone_number?: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_waitlist_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "member_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      member_waitlist_secrets: {
        Row: {
          created_at: string
          password_hash: string
          waitlist_id: string
        }
        Insert: {
          created_at?: string
          password_hash: string
          waitlist_id: string
        }
        Update: {
          created_at?: string
          password_hash?: string
          waitlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_waitlist_secrets_waitlist_id_fkey"
            columns: ["waitlist_id"]
            isOneToOne: true
            referencedRelation: "member_waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
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
      post_category_map: {
        Row: {
          category_id: string
          created_at: string | null
          created_by: string | null
          post_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          created_by?: string | null
          post_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          created_by?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_category_map_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "post_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_category_map_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
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
          type?: string
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
      profiles: {
        Row: {
          address: string
          created_at: string
          failed_login_attempts: number
          full_name: string
          id: string
          modified_at: string | null
          modified_by: string | null
          phone_number: string
          role: Database["public"]["Enums"]["user_role"]
          suspended_until: string | null
          username: string
        }
        Insert: {
          address?: string
          created_at?: string
          failed_login_attempts?: number
          full_name?: string
          id: string
          modified_at?: string | null
          modified_by?: string | null
          phone_number?: string
          role?: Database["public"]["Enums"]["user_role"]
          suspended_until?: string | null
          username: string
        }
        Update: {
          address?: string
          created_at?: string
          failed_login_attempts?: number
          full_name?: string
          id?: string
          modified_at?: string | null
          modified_by?: string | null
          phone_number?: string
          role?: Database["public"]["Enums"]["user_role"]
          suspended_until?: string | null
          username?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          date: string
          description: string | null
          id: string
          modified_at: string | null
          modified_by: string | null
          title: string
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by: string
          date: string
          description?: string | null
          id?: string
          modified_at?: string | null
          modified_by?: string | null
          title: string
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          date?: string
          description?: string | null
          id?: string
          modified_at?: string | null
          modified_by?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_balance_before_date: {
        Args: { target_date: string }
        Returns: number
      }
      get_transaction_date_range: {
        Args: never
        Returns: {
          max_date: string
          min_date: string
        }[]
      }
      set_user_password_hash: {
        Args: { p_hash: string; p_user_id: string }
        Returns: undefined
      }
      submit_waitlist: {
        Args: {
          p_address: string
          p_email: string
          p_full_name: string
          p_invite_id?: string
          p_password: string
          p_phone_number: string
          p_username: string
        }
        Returns: string
      }
    }
    Enums: {
      user_role: "SUPERADMIN" | "ADMINISTRATOR" | "MEMBER" | "MERCHANT"
      waitlist_status: "PENDING" | "APPROVED" | "REJECTED"
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
      user_role: ["SUPERADMIN", "ADMINISTRATOR", "MEMBER", "MERCHANT"],
      waitlist_status: ["PENDING", "APPROVED", "REJECTED"],
    },
  },
} as const
