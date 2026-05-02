// lib/supabase/types.ts
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
// Manual types while you set up the CLI:

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          stars_total: number;
          last_module: string | null;
          completed_modules: string[];
          child_name: string | null;
          avatar: string;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          stars_total?: number;
          last_module?: string | null;
          completed_modules?: string[];
          child_name?: string | null;
          avatar?: string;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          stars_total?: number;
          last_module?: string | null;
          completed_modules?: string[];
          child_name?: string | null;
          avatar?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
