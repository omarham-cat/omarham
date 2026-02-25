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
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "customer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          calories: number | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          calories?: number | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          calories?: number | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          weight_grams: number;
          price: number;
          stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          label: string;
          weight_grams: number;
          price: number;
          stock?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          label?: string;
          weight_grams?: number;
          price?: number;
          stock?: number;
          created_at?: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          name: string;
          is_allergen: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_allergen?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_allergen?: boolean;
          created_at?: string;
        };
      };
      product_ingredients: {
        Row: {
          product_id: string;
          ingredient_id: string;
        };
        Insert: {
          product_id: string;
          ingredient_id: string;
        };
        Update: {
          product_id?: string;
          ingredient_id?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
          total: number;
          razorpay_payment_id: string | null;
          razorpay_order_id: string | null;
          shipping_address: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
          total: number;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          shipping_address: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
          total?: number;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          shipping_address?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          quantity: number;
          price_at_purchase: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          quantity: number;
          price_at_purchase: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          variant_id?: string;
          quantity?: number;
          price_at_purchase?: number;
          created_at?: string;
        };
      };
      catering_menu_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          service_time: "breakfast" | "lunch" | "snacks" | "dinner" | "late_night";
          price_per_person: number;
          description: string | null;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          service_time: "breakfast" | "lunch" | "snacks" | "dinner" | "late_night";
          price_per_person: number;
          description?: string | null;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          service_time?: "breakfast" | "lunch" | "snacks" | "dinner" | "late_night";
          price_per_person?: number;
          description?: string | null;
          is_available?: boolean;
          created_at?: string;
        };
      };
      catering_addons: {
        Row: {
          id: string;
          name: string;
          addon_type: string;
          price: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          addon_type: string;
          price: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          addon_type?: string;
          price?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      catering_quotes: {
        Row: {
          id: string;
          user_id: string | null;
          num_days: number;
          num_guests: number;
          estimated_total: number;
          status: "draft" | "pending" | "reviewed" | "accepted" | "rejected";
          contact_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          event_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          num_days: number;
          num_guests: number;
          estimated_total: number;
          status?: "draft" | "pending" | "reviewed" | "accepted" | "rejected";
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          event_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          num_days?: number;
          num_guests?: number;
          estimated_total?: number;
          status?: "draft" | "pending" | "reviewed" | "accepted" | "rejected";
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          event_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quote_days: {
        Row: {
          id: string;
          quote_id: string;
          day_number: number;
        };
        Insert: {
          id?: string;
          quote_id: string;
          day_number: number;
        };
        Update: {
          id?: string;
          quote_id?: string;
          day_number?: number;
        };
      };
      quote_day_items: {
        Row: {
          id: string;
          quote_day_id: string;
          menu_item_id: string;
          service_time: string;
        };
        Insert: {
          id?: string;
          quote_day_id: string;
          menu_item_id: string;
          service_time: string;
        };
        Update: {
          id?: string;
          quote_day_id?: string;
          menu_item_id?: string;
          service_time?: string;
        };
      };
      quote_addons: {
        Row: {
          id: string;
          quote_id: string;
          addon_id: string;
          quantity: number;
        };
        Insert: {
          id?: string;
          quote_id: string;
          addon_id: string;
          quantity: number;
        };
        Update: {
          id?: string;
          quote_id?: string;
          addon_id?: string;
          quantity?: number;
        };
      };
      catering_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          event_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          event_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          event_type?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Product = Tables<"products"> & {
  category?: Tables<"categories">;
  variants?: Tables<"product_variants">[];
  ingredients?: Tables<"ingredients">[];
};

export type OrderWithItems = Tables<"orders"> & {
  order_items: (Tables<"order_items"> & {
    product: Tables<"products">;
    variant: Tables<"product_variants">;
  })[];
};

export type CateringQuoteWithDetails = Tables<"catering_quotes"> & {
  quote_days: (Tables<"quote_days"> & {
    quote_day_items: (Tables<"quote_day_items"> & {
      menu_item: Tables<"catering_menu_items">;
    })[];
  })[];
  quote_addons: (Tables<"quote_addons"> & {
    addon: Tables<"catering_addons">;
  })[];
};
