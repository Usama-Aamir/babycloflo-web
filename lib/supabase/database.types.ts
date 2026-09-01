export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          name: string;
          name_urdu: string | null;
          slug: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          name: string;
          name_urdu?: string | null;
          slug: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          name_urdu?: string | null;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          color_id: string | null;
          id: string;
          order_id: string;
          price_at_purchase: number;
          product_id: string;
          quantity: number;
          variant_id: string;
        };
        Insert: {
          color_id?: string | null;
          id?: string;
          order_id: string;
          price_at_purchase: number;
          product_id: string;
          quantity?: number;
          variant_id: string;
        };
        Update: {
          color_id?: string | null;
          id?: string;
          order_id?: string;
          price_at_purchase?: number;
          product_id?: string;
          quantity?: number;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_color_id_fkey";
            columns: ["color_id"];
            isOneToOne: false;
            referencedRelation: "variant_colors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address: string;
          city: string;
          created_at: string;
          customer_id: string | null;
          customer_name: string;
          delivery_charge: number;
          gift_note: string | null;
          gift_wrap_fee: number;
          id: string;
          is_gift_box: boolean;
          notes: string | null;
          order_type: string;
          phone: string;
          status: string;
        };
        Insert: {
          address: string;
          city: string;
          created_at?: string;
          customer_id?: string | null;
          customer_name: string;
          delivery_charge?: number;
          gift_note?: string | null;
          gift_wrap_fee?: number;
          id?: string;
          is_gift_box?: boolean;
          notes?: string | null;
          order_type?: string;
          phone: string;
          status?: string;
        };
        Update: {
          address?: string;
          city?: string;
          created_at?: string;
          customer_id?: string | null;
          customer_name?: string;
          delivery_charge?: number;
          gift_note?: string | null;
          gift_wrap_fee?: number;
          id?: string;
          is_gift_box?: boolean;
          notes?: string | null;
          order_type?: string;
          phone?: string;
          status?: string;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          created_at: string;
          finish: string | null;
          id: string;
          price: number;
          product_id: string;
          size: string;
          sku: string | null;
          stock_status: string;
        };
        Insert: {
          created_at?: string;
          finish?: string | null;
          id?: string;
          price: number;
          product_id: string;
          size: string;
          sku?: string | null;
          stock_status?: string;
        };
        Update: {
          created_at?: string;
          finish?: string | null;
          id?: string;
          price?: number;
          product_id?: string;
          size?: string;
          sku?: string | null;
          stock_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          base_images: string[] | null;
          category_id: string;
          created_at: string;
          description: string | null;
          id: string;
          is_giftable: boolean;
          name: string;
          status: string;
        };
        Insert: {
          base_images?: string[] | null;
          category_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_giftable?: boolean;
          name: string;
          status?: string;
        };
        Update: {
          base_images?: string[] | null;
          category_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_giftable?: boolean;
          name?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          delivery_charge: number;
          gift_wrap_fee: number;
          id: string;
          store_address: string | null;
          store_contact_email: string | null;
          whatsapp_number: string | null;
        };
        Insert: {
          delivery_charge?: number;
          gift_wrap_fee?: number;
          id?: string;
          store_address?: string | null;
          store_contact_email?: string | null;
          whatsapp_number?: string | null;
        };
        Update: {
          delivery_charge?: number;
          gift_wrap_fee?: number;
          id?: string;
          store_address?: string | null;
          store_contact_email?: string | null;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
      variant_colors: {
        Row: {
          color_name: string;
          created_at: string;
          id: string;
          swatch_image_url: string | null;
          variant_id: string;
        };
        Insert: {
          color_name: string;
          created_at?: string;
          id?: string;
          swatch_image_url?: string | null;
          variant_id: string;
        };
        Update: {
          color_name?: string;
          created_at?: string;
          id?: string;
          swatch_image_url?: string | null;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "variant_colors_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
