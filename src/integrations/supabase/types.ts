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
      anime: {
        Row: {
          created_at: string
          horizontal_img: string | null
          id: string
          img: string | null
          name: string
          overview: string | null
          release_year: string | null
          status: string | null
          tag: string[] | null
        }
        Insert: {
          created_at?: string
          horizontal_img?: string | null
          id?: string
          img?: string | null
          name: string
          overview?: string | null
          release_year?: string | null
          status?: string | null
          tag?: string[] | null
        }
        Update: {
          created_at?: string
          horizontal_img?: string | null
          id?: string
          img?: string | null
          name?: string
          overview?: string | null
          release_year?: string | null
          status?: string | null
          tag?: string[] | null
        }
        Relationships: []
      }
      collection_anime: {
        Row: {
          anime_id: string
          collection_id: string
        }
        Insert: {
          anime_id: string
          collection_id: string
        }
        Update: {
          anime_id?: string
          collection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_anime_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_anime_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      episode_comments: {
        Row: {
          comment_text: string
          created_at: string
          episode_id: string
          id: string
          ip_address: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          episode_id: string
          id?: string
          ip_address: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          episode_id?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          anime_id: string
          created_at: string
          duration: number | null
          episode_number: number
          id: string
          name: string
          poster: string | null
          stream_url: string | null
        }
        Insert: {
          anime_id: string
          created_at?: string
          duration?: number | null
          episode_number: number
          id?: string
          name: string
          poster?: string | null
          stream_url?: string | null
        }
        Update: {
          anime_id?: string
          created_at?: string
          duration?: number | null
          episode_number?: number
          id?: string
          name?: string
          poster?: string | null
          stream_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes_interactions: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          interaction_type: string
          ip_address: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          interaction_type: string
          ip_address: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          interaction_type?: string
          ip_address?: string
        }
        Relationships: []
      }
      video_progress: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          ip_address: string
          last_watched: string
          progress: number
          total_duration: number | null
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          ip_address: string
          last_watched?: string
          progress: number
          total_duration?: number | null
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          ip_address?: string
          last_watched?: string
          progress?: number
          total_duration?: number | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
