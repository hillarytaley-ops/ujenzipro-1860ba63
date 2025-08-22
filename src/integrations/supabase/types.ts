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
      cameras: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          project_id: string | null
          stream_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          project_id?: string | null
          stream_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          project_id?: string | null
          stream_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cameras_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          actual_delivery_time: string | null
          builder_id: string | null
          created_at: string
          delivery_address: string
          delivery_date: string | null
          driver_name: string | null
          driver_phone: string | null
          estimated_delivery_time: string | null
          id: string
          material_type: string
          notes: string | null
          pickup_address: string
          pickup_date: string | null
          project_id: string | null
          quantity: number
          status: string | null
          supplier_id: string | null
          tracking_number: string | null
          updated_at: string
          vehicle_details: string | null
          weight_kg: number | null
        }
        Insert: {
          actual_delivery_time?: string | null
          builder_id?: string | null
          created_at?: string
          delivery_address: string
          delivery_date?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          estimated_delivery_time?: string | null
          id?: string
          material_type: string
          notes?: string | null
          pickup_address: string
          pickup_date?: string | null
          project_id?: string | null
          quantity: number
          status?: string | null
          supplier_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          vehicle_details?: string | null
          weight_kg?: number | null
        }
        Update: {
          actual_delivery_time?: string | null
          builder_id?: string | null
          created_at?: string
          delivery_address?: string
          delivery_date?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          estimated_delivery_time?: string | null
          id?: string
          material_type?: string
          notes?: string | null
          pickup_address?: string
          pickup_date?: string | null
          project_id?: string | null
          quantity?: number
          status?: string | null
          supplier_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          vehicle_details?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notes: {
        Row: {
          content_type: string | null
          created_at: string
          delivery_note_number: string
          dispatch_date: string
          expected_delivery_date: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          notes: string | null
          purchase_order_id: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          delivery_note_number: string
          dispatch_date: string
          expected_delivery_date?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          notes?: string | null
          purchase_order_id: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          delivery_note_number?: string
          dispatch_date?: string
          expected_delivery_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          notes?: string | null
          purchase_order_id?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_orders: {
        Row: {
          builder_id: string
          created_at: string
          delivery_address: string
          id: string
          materials: Json
          notes: string | null
          order_number: string
          pickup_address: string
          project_id: string | null
          qr_coded_items: number
          status: string
          supplier_id: string
          total_items: number
          updated_at: string
        }
        Insert: {
          builder_id: string
          created_at?: string
          delivery_address: string
          id?: string
          materials?: Json
          notes?: string | null
          order_number: string
          pickup_address: string
          project_id?: string | null
          qr_coded_items?: number
          status?: string
          supplier_id: string
          total_items?: number
          updated_at?: string
        }
        Update: {
          builder_id?: string
          created_at?: string
          delivery_address?: string
          id?: string
          materials?: Json
          notes?: string | null
          order_number?: string
          pickup_address?: string
          project_id?: string | null
          qr_coded_items?: number
          status?: string
          supplier_id?: string
          total_items?: number
          updated_at?: string
        }
        Relationships: []
      }
      delivery_providers: {
        Row: {
          address: string | null
          availability_schedule: Json | null
          capacity_kg: number | null
          contact_person: string | null
          created_at: string
          email: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          per_km_rate: number | null
          phone: string
          provider_name: string
          provider_type: string
          rating: number | null
          service_areas: string[] | null
          total_deliveries: number | null
          updated_at: string
          user_id: string
          vehicle_types: string[] | null
        }
        Insert: {
          address?: string | null
          availability_schedule?: Json | null
          capacity_kg?: number | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          per_km_rate?: number | null
          phone: string
          provider_name: string
          provider_type?: string
          rating?: number | null
          service_areas?: string[] | null
          total_deliveries?: number | null
          updated_at?: string
          user_id: string
          vehicle_types?: string[] | null
        }
        Update: {
          address?: string | null
          availability_schedule?: Json | null
          capacity_kg?: number | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          per_km_rate?: number | null
          phone?: string
          provider_name?: string
          provider_type?: string
          rating?: number | null
          service_areas?: string[] | null
          total_deliveries?: number | null
          updated_at?: string
          user_id?: string
          vehicle_types?: string[] | null
        }
        Relationships: []
      }
      delivery_requests: {
        Row: {
          budget_range: string | null
          builder_id: string
          created_at: string
          delivery_address: string
          id: string
          material_type: string
          pickup_address: string
          pickup_date: string
          preferred_time: string | null
          provider_id: string | null
          quantity: number
          special_instructions: string | null
          status: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          budget_range?: string | null
          builder_id: string
          created_at?: string
          delivery_address: string
          id?: string
          material_type: string
          pickup_address: string
          pickup_date: string
          preferred_time?: string | null
          provider_id?: string | null
          quantity: number
          special_instructions?: string | null
          status?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          budget_range?: string | null
          builder_id?: string
          created_at?: string
          delivery_address?: string
          id?: string
          material_type?: string
          pickup_address?: string
          pickup_date?: string
          preferred_time?: string | null
          provider_id?: string | null
          quantity?: number
          special_instructions?: string | null
          status?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      delivery_updates: {
        Row: {
          created_at: string
          delivery_id: string | null
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          created_at?: string
          delivery_id?: string | null
          id?: string
          notes?: string | null
          status: string
        }
        Update: {
          created_at?: string
          delivery_id?: string | null
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_updates_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string | null
          comment: string | null
          created_at: string
          delivery_id: string | null
          id: string
          rating: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          comment?: string | null
          created_at?: string
          delivery_id?: string | null
          id?: string
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          comment?: string | null
          created_at?: string
          delivery_id?: string | null
          id?: string
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_materials: {
        Row: {
          batch_number: string | null
          created_at: string
          id: string
          is_qr_coded: boolean
          is_scanned: boolean
          material_type: string
          order_id: string
          qr_code: string | null
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          id?: string
          is_qr_coded?: boolean
          is_scanned?: boolean
          material_type: string
          order_id: string
          qr_code?: string | null
          quantity: number
          unit?: string
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          id?: string
          is_qr_coded?: boolean
          is_scanned?: boolean
          material_type?: string
          order_id?: string
          qr_code?: string | null
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_materials_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          access_code: string | null
          builder_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          access_code?: string | null
          builder_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          access_code?: string | null
          builder_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          buyer_id: string
          created_at: string
          delivery_address: string
          delivery_date: string
          id: string
          items: Json
          payment_terms: string | null
          po_number: string
          qr_code_generated: boolean | null
          qr_code_url: string | null
          quotation_request_id: string | null
          special_instructions: string | null
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          delivery_address: string
          delivery_date: string
          id?: string
          items?: Json
          payment_terms?: string | null
          po_number: string
          qr_code_generated?: boolean | null
          qr_code_url?: string | null
          quotation_request_id?: string | null
          special_instructions?: string | null
          status?: string
          supplier_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          delivery_address?: string
          delivery_date?: string
          id?: string
          items?: Json
          payment_terms?: string | null
          po_number?: string
          qr_code_generated?: boolean | null
          qr_code_url?: string | null
          quotation_request_id?: string | null
          special_instructions?: string | null
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      quotation_requests: {
        Row: {
          created_at: string
          delivery_address: string
          id: string
          material_name: string
          preferred_delivery_date: string | null
          project_description: string | null
          quantity: number
          quote_amount: number | null
          quote_valid_until: string | null
          requester_id: string
          special_requirements: string | null
          status: string
          supplier_id: string
          supplier_notes: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_address: string
          id?: string
          material_name: string
          preferred_delivery_date?: string | null
          project_description?: string | null
          quantity: number
          quote_amount?: number | null
          quote_valid_until?: string | null
          requester_id: string
          special_requirements?: string | null
          status?: string
          supplier_id: string
          supplier_notes?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_address?: string
          id?: string
          material_name?: string
          preferred_delivery_date?: string | null
          project_description?: string | null
          quantity?: number
          quote_amount?: number | null
          quote_valid_until?: string | null
          requester_id?: string
          special_requirements?: string | null
          status?: string
          supplier_id?: string
          supplier_notes?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      receipt_uploads: {
        Row: {
          content_type: string | null
          created_at: string
          delivery_id: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          notes: string | null
          receipt_type: string | null
          scanned_supply_id: string | null
          shared_with_builder: boolean | null
          supplier_id: string | null
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          delivery_id?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          notes?: string | null
          receipt_type?: string | null
          scanned_supply_id?: string | null
          shared_with_builder?: boolean | null
          supplier_id?: string | null
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          delivery_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          notes?: string | null
          receipt_type?: string | null
          scanned_supply_id?: string | null
          shared_with_builder?: boolean | null
          supplier_id?: string | null
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_uploads_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_uploads_scanned_supply_id_fkey"
            columns: ["scanned_supply_id"]
            isOneToOne: false
            referencedRelation: "scanned_supplies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_uploads_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      scanned_receivables: {
        Row: {
          batch_number: string | null
          condition: string | null
          delivery_id: string | null
          id: string
          material_type: string
          notes: string | null
          project_id: string | null
          qr_code: string
          quantity: number | null
          received_at: string
          scanned_by: string | null
          supplier_info: string | null
          unit: string | null
          verified: boolean | null
        }
        Insert: {
          batch_number?: string | null
          condition?: string | null
          delivery_id?: string | null
          id?: string
          material_type: string
          notes?: string | null
          project_id?: string | null
          qr_code: string
          quantity?: number | null
          received_at?: string
          scanned_by?: string | null
          supplier_info?: string | null
          unit?: string | null
          verified?: boolean | null
        }
        Update: {
          batch_number?: string | null
          condition?: string | null
          delivery_id?: string | null
          id?: string
          material_type?: string
          notes?: string | null
          project_id?: string | null
          qr_code?: string
          quantity?: number | null
          received_at?: string
          scanned_by?: string | null
          supplier_info?: string | null
          unit?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "scanned_receivables_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scanned_receivables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scanned_supplies: {
        Row: {
          batch_number: string | null
          id: string
          material_type: string
          notes: string | null
          qr_code: string
          quantity: number | null
          scanned_at: string
          scanned_by: string | null
          status: string | null
          supplier_id: string | null
          supplier_info: string | null
          unit: string | null
        }
        Insert: {
          batch_number?: string | null
          id?: string
          material_type: string
          notes?: string | null
          qr_code: string
          quantity?: number | null
          scanned_at?: string
          scanned_by?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_info?: string | null
          unit?: string | null
        }
        Update: {
          batch_number?: string | null
          id?: string
          material_type?: string
          notes?: string | null
          qr_code?: string
          quantity?: number | null
          scanned_at?: string
          scanned_by?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_info?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scanned_supplies_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          company_name: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_verified: boolean | null
          materials_offered: string[] | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean | null
          materials_offered?: string[] | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean | null
          materials_offered?: string[] | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_updates: {
        Row: {
          created_at: string
          delivery_id: string | null
          id: string
          location: string | null
          notes: string | null
          status: string
        }
        Insert: {
          created_at?: string
          delivery_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          status: string
        }
        Update: {
          created_at?: string
          delivery_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_updates_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_access_code: {
        Args: Record<PropertyKey, never>
        Returns: string
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
