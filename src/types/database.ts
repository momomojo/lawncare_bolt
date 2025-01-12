export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          email: string
          phone_number: string | null
          user_role: 'admin' | 'customer' | 'landscaper'
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          street_address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          account_status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      companies: {
        Row: {
          company_id: string
          owner_id: string
          company_name: string
          business_license: string | null
          tax_id: string | null
          founded_date: string | null
          business_email: string
          business_phone: string
          website_url: string | null
          business_address: string
          service_radius_miles: number
          logo_url: string | null
          image_gallery_urls: string[] | null
          business_status: 'active' | 'inactive' | 'verified'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      service_catalog: {
        Row: {
          service_id: string
          company_id: string
          service_name: string
          description: string | null
          duration_minutes: number
          base_price: number
          price_unit: 'fixed' | 'hourly' | 'sqft'
          scheduling_window_days: number
          max_daily_bookings: number | null
          service_category: 'mowing' | 'trimming' | 'landscaping' | 'cleanup'
          service_status: 'active' | 'inactive' | 'seasonal'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['service_catalog']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['service_catalog']['Insert']>
      }
    }
  }
}