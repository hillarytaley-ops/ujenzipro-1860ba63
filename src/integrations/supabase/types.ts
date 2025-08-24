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
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          request_count: number | null
          updated_at: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
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
      delivery_acknowledgements: {
        Row: {
          acknowledged_by: string
          acknowledgement_date: string
          acknowledger_id: string
          comments: string | null
          created_at: string
          delivery_note_id: string
          digital_signature: string
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          signed_document_path: string | null
          updated_at: string
        }
        Insert: {
          acknowledged_by: string
          acknowledgement_date?: string
          acknowledger_id: string
          comments?: string | null
          created_at?: string
          delivery_note_id: string
          digital_signature: string
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          signed_document_path?: string | null
          updated_at?: string
        }
        Update: {
          acknowledged_by?: string
          acknowledgement_date?: string
          acknowledger_id?: string
          comments?: string | null
          created_at?: string
          delivery_note_id?: string
          digital_signature?: string
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          signed_document_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_acknowledgements_acknowledger_id_fkey"
            columns: ["acknowledger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_acknowledgements_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_communications: {
        Row: {
          content: string | null
          created_at: string
          delivery_request_id: string | null
          id: string
          message_type: string
          metadata: Json | null
          read_by: Json | null
          sender_id: string
          sender_name: string
          sender_type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          delivery_request_id?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          read_by?: Json | null
          sender_id: string
          sender_name: string
          sender_type: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          delivery_request_id?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          read_by?: Json | null
          sender_id?: string
          sender_name?: string
          sender_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_communications_delivery_request_id_fkey"
            columns: ["delivery_request_id"]
            isOneToOne: false
            referencedRelation: "delivery_requests"
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
          qr_code_generated: boolean | null
          qr_code_url: string | null
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
          qr_code_generated?: boolean | null
          qr_code_url?: string | null
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
          qr_code_generated?: boolean | null
          qr_code_url?: string | null
          qr_coded_items?: number
          status?: string
          supplier_id?: string
          total_items?: number
          updated_at?: string
        }
        Relationships: []
      }
      delivery_provider_listings: {
        Row: {
          capacity_kg: number | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          per_km_rate: number | null
          provider_id: string
          provider_name: string
          provider_type: string
          rating: number | null
          service_areas: string[] | null
          total_deliveries: number | null
          updated_at: string | null
          vehicle_types: string[] | null
        }
        Insert: {
          capacity_kg?: number | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          per_km_rate?: number | null
          provider_id: string
          provider_name: string
          provider_type?: string
          rating?: number | null
          service_areas?: string[] | null
          total_deliveries?: number | null
          updated_at?: string | null
          vehicle_types?: string[] | null
        }
        Update: {
          capacity_kg?: number | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          per_km_rate?: number | null
          provider_id?: string
          provider_name?: string
          provider_type?: string
          rating?: number | null
          service_areas?: string[] | null
          total_deliveries?: number | null
          updated_at?: string | null
          vehicle_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_provider_listings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "delivery_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_providers: {
        Row: {
          address: string | null
          availability_schedule: Json | null
          capacity_kg: number | null
          contact_person: string | null
          created_at: string
          driving_license_class: string | null
          driving_license_document_path: string | null
          driving_license_expiry: string | null
          driving_license_number: string | null
          driving_license_verified: boolean | null
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
          driving_license_class?: string | null
          driving_license_document_path?: string | null
          driving_license_expiry?: string | null
          driving_license_number?: string | null
          driving_license_verified?: boolean | null
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
          driving_license_class?: string | null
          driving_license_document_path?: string | null
          driving_license_expiry?: string | null
          driving_license_number?: string | null
          driving_license_verified?: boolean | null
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
      delivery_providers_public: {
        Row: {
          capacity_kg: number | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          per_km_rate: number | null
          provider_id: string
          provider_name: string
          provider_type: string
          rating: number | null
          service_areas: string[] | null
          total_deliveries: number | null
          updated_at: string | null
          vehicle_types: string[] | null
        }
        Insert: {
          capacity_kg?: number | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          per_km_rate?: number | null
          provider_id: string
          provider_name: string
          provider_type?: string
          rating?: number | null
          service_areas?: string[] | null
          total_deliveries?: number | null
          updated_at?: string | null
          vehicle_types?: string[] | null
        }
        Update: {
          capacity_kg?: number | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          per_km_rate?: number | null
          provider_id?: string
          provider_name?: string
          provider_type?: string
          rating?: number | null
          service_areas?: string[] | null
          total_deliveries?: number | null
          updated_at?: string | null
          vehicle_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_providers_public_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "delivery_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_requests: {
        Row: {
          budget_range: string | null
          builder_id: string
          created_at: string
          delivery_address: string
          delivery_latitude: number | null
          delivery_longitude: number | null
          id: string
          material_type: string
          pickup_address: string
          pickup_date: string
          pickup_latitude: number | null
          pickup_longitude: number | null
          preferred_time: string | null
          provider_id: string | null
          provider_response: string | null
          quantity: number
          required_vehicle_type: string | null
          response_date: string | null
          response_notes: string | null
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
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          id?: string
          material_type: string
          pickup_address: string
          pickup_date: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          preferred_time?: string | null
          provider_id?: string | null
          provider_response?: string | null
          quantity: number
          required_vehicle_type?: string | null
          response_date?: string | null
          response_notes?: string | null
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
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          id?: string
          material_type?: string
          pickup_address?: string
          pickup_date?: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          preferred_time?: string | null
          provider_id?: string | null
          provider_response?: string | null
          quantity?: number
          required_vehicle_type?: string | null
          response_date?: string | null
          response_notes?: string | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_requests_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_status_updates: {
        Row: {
          created_at: string
          delivery_request_id: string | null
          id: string
          location_latitude: number | null
          location_longitude: number | null
          notes: string | null
          status: string
          updated_by_id: string
          updated_by_name: string
          updated_by_type: string
        }
        Insert: {
          created_at?: string
          delivery_request_id?: string | null
          id?: string
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          status: string
          updated_by_id: string
          updated_by_name: string
          updated_by_type: string
        }
        Update: {
          created_at?: string
          delivery_request_id?: string | null
          id?: string
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          status?: string
          updated_by_id?: string
          updated_by_name?: string
          updated_by_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_status_updates_delivery_request_id_fkey"
            columns: ["delivery_request_id"]
            isOneToOne: false
            referencedRelation: "delivery_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tracking: {
        Row: {
          accuracy: number | null
          created_at: string
          delivery_request_id: string
          estimated_arrival: string | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          notes: string | null
          provider_id: string
          speed: number | null
          status: string
          updated_at: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          delivery_request_id: string
          estimated_arrival?: string | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          notes?: string | null
          provider_id: string
          speed?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          delivery_request_id?: string
          estimated_arrival?: string | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          notes?: string | null
          provider_id?: string
          speed?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_delivery_request_id_fkey"
            columns: ["delivery_request_id"]
            isOneToOne: false
            referencedRelation: "delivery_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "delivery_providers"
            referencedColumns: ["id"]
          },
        ]
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
      driver_info_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          delivery_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          delivery_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          delivery_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_info_access_log_delivery_id_fkey"
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
      goods_received_notes: {
        Row: {
          additional_notes: string | null
          builder_id: string
          created_at: string
          delivery_id: string | null
          delivery_note_reference: string | null
          discrepancies: string | null
          grn_number: string
          id: string
          items: Json
          overall_condition: string
          project_id: string | null
          received_by: string
          received_date: string
          status: string
          supplier_name: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          builder_id: string
          created_at?: string
          delivery_id?: string | null
          delivery_note_reference?: string | null
          discrepancies?: string | null
          grn_number: string
          id?: string
          items?: Json
          overall_condition?: string
          project_id?: string | null
          received_by: string
          received_date: string
          status?: string
          supplier_name: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          builder_id?: string
          created_at?: string
          delivery_id?: string | null
          delivery_note_reference?: string | null
          discrepancies?: string | null
          grn_number?: string
          id?: string
          items?: Json
          overall_condition?: string
          project_id?: string | null
          received_by?: string
          received_date?: string
          status?: string
          supplier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          data_fields_accessed: string[] | null
          delivery_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          data_fields_accessed?: string[] | null
          delivery_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          data_fields_accessed?: string[] | null
          delivery_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_data_access_log_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
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
      payment_info_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          acknowledgement_id: string | null
          id: string
          ip_address: unknown | null
          payment_fields_accessed: string[] | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          acknowledgement_id?: string | null
          id?: string
          ip_address?: unknown | null
          payment_fields_accessed?: string[] | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          acknowledgement_id?: string | null
          id?: string
          ip_address?: unknown | null
          payment_fields_accessed?: string[] | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_info_access_log_acknowledgement_id_fkey"
            columns: ["acknowledgement_id"]
            isOneToOne: false
            referencedRelation: "delivery_acknowledgements"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_preferences: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          payment_details: Json | null
          payment_method: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          payment_details?: Json | null
          payment_method: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          payment_details?: Json | null
          payment_method?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_license: string | null
          company_name: string | null
          company_registration: string | null
          created_at: string
          full_name: string | null
          id: string
          is_professional: boolean | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_license?: string | null
          company_name?: string | null
          company_registration?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_professional?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_license?: string | null
          company_name?: string | null
          company_registration?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_professional?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
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
          delivery_order_id: string | null
          id: string
          matched_supply_id: string | null
          material_type: string
          notes: string | null
          project_id: string | null
          qr_code: string
          quantity: number | null
          received_at: string
          received_by: string | null
          received_status: string | null
          scanned_by: string | null
          supplier_info: string | null
          unit: string | null
          verified: boolean | null
        }
        Insert: {
          batch_number?: string | null
          condition?: string | null
          delivery_id?: string | null
          delivery_order_id?: string | null
          id?: string
          matched_supply_id?: string | null
          material_type: string
          notes?: string | null
          project_id?: string | null
          qr_code: string
          quantity?: number | null
          received_at?: string
          received_by?: string | null
          received_status?: string | null
          scanned_by?: string | null
          supplier_info?: string | null
          unit?: string | null
          verified?: boolean | null
        }
        Update: {
          batch_number?: string | null
          condition?: string | null
          delivery_id?: string | null
          delivery_order_id?: string | null
          id?: string
          matched_supply_id?: string | null
          material_type?: string
          notes?: string | null
          project_id?: string | null
          qr_code?: string
          quantity?: number | null
          received_at?: string
          received_by?: string | null
          received_status?: string | null
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
          delivery_order_id: string | null
          dispatch_status: string | null
          dispatched_at: string | null
          dispatched_by: string | null
          id: string
          material_type: string
          notes: string | null
          qr_code: string
          quantity: number | null
          scanned_at: string
          scanned_by: string | null
          scanned_for_dispatch: boolean | null
          status: string | null
          supplier_id: string | null
          supplier_info: string | null
          unit: string | null
        }
        Insert: {
          batch_number?: string | null
          delivery_order_id?: string | null
          dispatch_status?: string | null
          dispatched_at?: string | null
          dispatched_by?: string | null
          id?: string
          material_type: string
          notes?: string | null
          qr_code: string
          quantity?: number | null
          scanned_at?: string
          scanned_by?: string | null
          scanned_for_dispatch?: boolean | null
          status?: string | null
          supplier_id?: string | null
          supplier_info?: string | null
          unit?: string | null
        }
        Update: {
          batch_number?: string | null
          delivery_order_id?: string | null
          dispatch_status?: string | null
          dispatched_at?: string | null
          dispatched_by?: string | null
          id?: string
          material_type?: string
          notes?: string | null
          qr_code?: string
          quantity?: number | null
          scanned_at?: string
          scanned_by?: string | null
          scanned_for_dispatch?: boolean | null
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
      can_access_driver_contact: {
        Args: {
          delivery_record: Database["public"]["Tables"]["deliveries"]["Row"]
        }
        Returns: boolean
      }
      can_access_driver_info: {
        Args: {
          delivery_record: Database["public"]["Tables"]["deliveries"]["Row"]
        }
        Returns: boolean
      }
      can_access_grn: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      can_access_location_data: {
        Args: {
          delivery_record: Database["public"]["Tables"]["deliveries"]["Row"]
        }
        Returns: boolean
      }
      can_access_payment_info: {
        Args: {
          acknowledgement_record: Database["public"]["Tables"]["delivery_acknowledgements"]["Row"]
        }
        Returns: boolean
      }
      generate_access_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_delivery_summaries: {
        Args: Record<PropertyKey, never>
        Returns: {
          actual_delivery_time: string
          builder_id: string
          created_at: string
          estimated_delivery_time: string
          general_delivery_area: string
          general_pickup_area: string
          has_driver_assigned: boolean
          id: string
          material_type: string
          project_id: string
          quantity: number
          status: string
          supplier_id: string
          tracking_number: string
          updated_at: string
          weight_kg: number
        }[]
      }
      get_my_provider_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          availability_schedule: Json
          capacity_kg: number
          created_at: string
          driving_license_class: string
          driving_license_document_path: string
          driving_license_expiry: string
          driving_license_number: string
          driving_license_verified: boolean
          email: string
          hourly_rate: number
          id: string
          is_active: boolean
          is_verified: boolean
          per_km_rate: number
          phone: string
          provider_name: string
          provider_type: string
          rating: number
          service_areas: string[]
          total_deliveries: number
          updated_at: string
          vehicle_types: string[]
        }[]
      }
      get_provider_business_info: {
        Args: { provider_uuid: string }
        Returns: {
          capacity_kg: number
          id: string
          is_active: boolean
          is_verified: boolean
          provider_name: string
          provider_type: string
          rating: number
          service_areas: string[]
          total_deliveries: number
          vehicle_types: string[]
        }[]
      }
      get_secure_acknowledgement: {
        Args: { acknowledgement_uuid: string }
        Returns: {
          acknowledged_by: string
          acknowledgement_date: string
          acknowledger_id: string
          can_view_payment: boolean
          comments: string
          created_at: string
          delivery_note_id: string
          digital_signature: string
          id: string
          payment_method: string
          payment_reference: string
          payment_status: string
          signed_document_path: string
          updated_at: string
        }[]
      }
      get_secure_delivery: {
        Args: { delivery_uuid: string }
        Returns: {
          actual_delivery_time: string
          builder_id: string
          can_view_driver_contact: boolean
          can_view_locations: boolean
          created_at: string
          delivery_address: string
          delivery_date: string
          driver_name: string
          driver_phone: string
          estimated_delivery_time: string
          id: string
          material_type: string
          notes: string
          pickup_address: string
          pickup_date: string
          project_id: string
          quantity: number
          status: string
          supplier_id: string
          tracking_number: string
          updated_at: string
          vehicle_details: string
          weight_kg: number
        }[]
      }
      get_user_deliveries: {
        Args: Record<PropertyKey, never>
        Returns: {
          actual_delivery_time: string
          builder_id: string
          can_view_driver_contact: boolean
          can_view_locations: boolean
          created_at: string
          delivery_address: string
          delivery_date: string
          driver_name: string
          driver_phone: string
          estimated_delivery_time: string
          id: string
          material_type: string
          notes: string
          pickup_address: string
          pickup_date: string
          project_id: string
          quantity: number
          status: string
          supplier_id: string
          tracking_number: string
          updated_at: string
          vehicle_details: string
          weight_kg: number
        }[]
      }
      log_driver_info_access: {
        Args: { access_type_param: string; delivery_uuid: string }
        Returns: undefined
      }
      log_location_data_access: {
        Args: {
          access_type_param: string
          delivery_uuid: string
          fields_accessed?: string[]
        }
        Returns: undefined
      }
      log_payment_info_access: {
        Args: {
          access_type_param: string
          acknowledgement_uuid: string
          fields_accessed?: string[]
        }
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
