import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Initialize the Supabase client
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://gywuotjnpxnvzconcpcu.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d3VvdGpucHhudnpjb25jcGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MzY4MDAsImV4cCI6MjAzMzAxMjgwMH0.Nh1tLN9MKI9wFPYFbTrRHyh8NZ4N9J1LBHsLHfJLQEU";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
