export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          email_verified: string | null;
          image: string | null;
          password: string | null;
          phone: string | null;
          role: "ADMIN" | "ORGANIZER" | "BUYER";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email: string;
          email_verified?: string | null;
          image?: string | null;
          password?: string | null;
          phone?: string | null;
          role?: "ADMIN" | "ORGANIZER" | "BUYER";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          email_verified?: string | null;
          image?: string | null;
          password?: string | null;
          phone?: string | null;
          role?: "ADMIN" | "ORGANIZER" | "BUYER";
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          provider: string;
          provider_account_id: string;
          refresh_token: string | null;
          access_token: string | null;
          expires_at: number | null;
          token_type: string | null;
          scope: string | null;
          id_token: string | null;
          session_state: string | null;
          refresh_token_expires_in: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          provider: string;
          provider_account_id: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
          refresh_token_expires_in?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          provider?: string;
          provider_account_id?: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
          refresh_token_expires_in?: number | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          session_token: string;
          user_id: string;
          expires: string;
        };
        Insert: {
          id?: string;
          session_token: string;
          user_id: string;
          expires: string;
        };
        Update: {
          id?: string;
          session_token?: string;
          user_id?: string;
          expires?: string;
        };
      };
      verification_tokens: {
        Row: {
          identifier: string;
          token: string;
          expires: string;
        };
        Insert: {
          identifier: string;
          token: string;
          expires: string;
        };
        Update: {
          identifier?: string;
          token?: string;
          expires?: string;
        };
      };
      organizers: {
        Row: {
          id: string;
          user_id: string;
          org_name: string;
          legal_name: string | null;
          npwp: string | null;
          verification_docs: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
          social_media: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_name: string;
          legal_name?: string | null;
          npwp?: string | null;
          verification_docs?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
          social_media?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          org_name?: string;
          legal_name?: string | null;
          npwp?: string | null;
          verification_docs?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
          social_media?: Json | null;
        };
      };
      events: {
        Row: {
          id: string;
          slug: string;
          organizer_id: string;
          title: string;
          description: string | null;
          poster_url: string | null;
          banner_url: string | null;
          category: string | null;
          venue: string;
          address: string | null;
          city: string | null;
          province: string;
          country: string;
          tags: string[];
          images: string[];
          featured: boolean;
          seating_map: string | null;
          max_attendees: number | null;
          website: string | null;
          terms: string | null;
          start_date: string;
          end_date: string;
          status:
            | "DRAFT"
            | "PENDING_REVIEW"
            | "PUBLISHED"
            | "REJECTED"
            | "COMPLETED"
            | "CANCELLED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          organizer_id: string;
          title: string;
          description?: string | null;
          poster_url?: string | null;
          banner_url?: string | null;
          category?: string | null;
          venue: string;
          address?: string | null;
          city?: string | null;
          province: string;
          country: string;
          tags: string[];
          images: string[];
          featured?: boolean;
          published?: boolean;
          seating_map?: string | null;
          max_attendees?: number | null;
          website?: string | null;
          terms?: string | null;
          start_date: string;
          end_date: string;
          status?:
            | "DRAFT"
            | "PENDING_REVIEW"
            | "PUBLISHED"
            | "REJECTED"
            | "COMPLETED"
            | "CANCELLED";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          organizer_id?: string;
          title?: string;
          description?: string | null;
          poster_url?: string | null;
          banner_url?: string | null;
          category?: string | null;
          venue?: string;
          address?: string | null;
          city?: string | null;
          province?: string;
          country?: string;
          tags?: string[];
          images?: string[];
          featured?: boolean;
          published?: boolean;
          seating_map?: string | null;
          max_attendees?: number | null;
          website?: string | null;
          terms?: string | null;
          start_date?: string;
          end_date?: string;
          status?:
            | "DRAFT"
            | "PENDING_REVIEW"
            | "PUBLISHED"
            | "REJECTED"
            | "COMPLETED"
            | "CANCELLED";
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_types: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          quantity: number;
          sold: number;
          max_per_purchase: number;
          is_visible: boolean;
          allow_transfer: boolean;
          ticket_features: string | null;
          perks: string | null;
          early_bird_deadline: string | null;
          sale_start_date: string | null;
          sale_end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          quantity: number;
          sold?: number;
          max_per_purchase?: number;
          is_visible?: boolean;
          allow_transfer?: boolean;
          ticket_features?: string | null;
          perks?: string | null;
          early_bird_deadline?: string | null;
          sale_start_date?: string | null;
          sale_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          quantity?: number;
          sold?: number;
          max_per_purchase?: number;
          is_visible?: boolean;
          allow_transfer?: boolean;
          ticket_features?: string | null;
          perks?: string | null;
          early_bird_deadline?: string | null;
          sale_start_date?: string | null;
          sale_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          amount: number;
          currency: string;
          payment_method: string;
          payment_reference: string | null;
          invoice_number: string;
          status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
          details: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          amount: number;
          currency?: string;
          payment_method: string;
          payment_reference?: string | null;
          invoice_number: string;
          status?: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
          details?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          amount?: number;
          currency?: string;
          payment_method?: string;
          payment_reference?: string | null;
          invoice_number?: string;
          status?: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
          details?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          ticket_type_id: string;
          quantity: number;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          ticket_type_id: string;
          quantity: number;
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          ticket_type_id?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          gateway: string;
          amount: number;
          status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
          payment_id: string | null;
          hmac_signature: string | null;
          callback_payload: Json | null;
          received_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          gateway: string;
          amount: number;
          status?: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
          payment_id?: string | null;
          hmac_signature?: string | null;
          callback_payload?: Json | null;
          received_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          gateway?: string;
          amount?: number;
          status?: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
          payment_id?: string | null;
          hmac_signature?: string | null;
          callback_payload?: Json | null;
          received_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      e_tickets: {
        Row: {
          id: string;
          order_id: string;
          qr_code_data: string;
          file_url: string | null;
          generated_at: string;
          delivered: boolean;
          delivered_at: string | null;
          scanned_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          qr_code_data: string;
          file_url?: string | null;
          generated_at?: string;
          delivered?: boolean;
          delivered_at?: string | null;
          scanned_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          qr_code_data?: string;
          file_url?: string | null;
          generated_at?: string;
          delivered?: boolean;
          delivered_at?: string | null;
          scanned_at?: string | null;
        };
      };
      approvals: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          reviewer_id: string | null;
          status: "PENDING" | "APPROVED" | "REJECTED";
          notes: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          reviewer_id?: string | null;
          status?: "PENDING" | "APPROVED" | "REJECTED";
          notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          reviewer_id?: string | null;
          status?: "PENDING" | "APPROVED" | "REJECTED";
          notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity: string | null;
          entity_id: string | null;
          metadata: Json | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          timestamp?: string;
        };
      };
      validators: {
        Row: {
          id: string;
          user_id: string;
          event_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_ids: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      bank_accounts: {
        Row: {
          id: string;
          organizer_id: string;
          bank_name: string;
          account_name: string;
          account_number: string;
          branch: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          bank_name: string;
          account_name: string;
          account_number: string;
          branch?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          bank_name?: string;
          account_name?: string;
          account_number?: string;
          branch?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      withdrawals: {
        Row: {
          id: string;
          organizer_id: string;
          amount: number;
          currency: string;
          status:
            | "PENDING"
            | "PROCESSING"
            | "COMPLETED"
            | "CANCELLED"
            | "FAILED";
          reference: string | null;
          notes: string | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          amount: number;
          currency?: string;
          status?:
            | "PENDING"
            | "PROCESSING"
            | "COMPLETED"
            | "CANCELLED"
            | "FAILED";
          reference?: string | null;
          notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          amount?: number;
          currency?: string;
          status?:
            | "PENDING"
            | "PROCESSING"
            | "COMPLETED"
            | "CANCELLED"
            | "FAILED";
          reference?: string | null;
          notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      crews: {
        Row: {
          id: string;
          organizer_id: string;
          event_id: string;
          name: string;
          role: string;
          email: string | null;
          phone: string | null;
          id_card_number: string;
          barcode: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          event_id: string;
          name: string;
          role: string;
          email?: string | null;
          phone?: string | null;
          id_card_number: string;
          barcode: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          event_id?: string;
          name?: string;
          role?: string;
          email?: string | null;
          phone?: string | null;
          id_card_number?: string;
          barcode?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      vouchers: {
        Row: {
          id: string;
          organizer_id: string;
          event_id: string | null;
          code: string;
          discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
          discount_value: number;
          max_usage: number;
          used_count: number;
          min_purchase_amount: number | null;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          event_id?: string | null;
          code: string;
          discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
          discount_value: number;
          max_usage: number;
          used_count?: number;
          min_purchase_amount?: number | null;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          event_id?: string | null;
          code?: string;
          discount_type?: "PERCENTAGE" | "FIXED_AMOUNT";
          discount_value?: number;
          max_usage?: number;
          used_count?: number;
          min_purchase_amount?: number | null;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          ticket_type_id: string;
          transaction_id: string;
          user_id: string;
          qr_code: string;
          status: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
          checked_in: boolean;
          check_in_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_type_id: string;
          transaction_id: string;
          user_id: string;
          qr_code: string;
          status?: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
          checked_in?: boolean;
          check_in_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_type_id?: string;
          transaction_id?: string;
          user_id?: string;
          qr_code?: string;
          status?: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
          checked_in?: boolean;
          check_in_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "ADMIN" | "ORGANIZER" | "BUYER";
      event_status:
        | "DRAFT"
        | "PENDING_REVIEW"
        | "PUBLISHED"
        | "REJECTED"
        | "COMPLETED"
        | "CANCELLED";
      payment_status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
      approval_status: "PENDING" | "APPROVED" | "REJECTED";
      ticket_status: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
      withdrawal_status:
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "CANCELLED"
        | "FAILED";
      discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Client-side helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Create client function
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const createSupabaseClient = (): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  return createClient<Database>(supabaseUrl, supabaseKey);
};
