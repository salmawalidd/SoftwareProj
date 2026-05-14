import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://dmmrrvghkdxtticeabuj.supabase.co";

const supabaseAnonKey =
  "sb_publishable_vSH3L1DL5ZiaGh4b-puubw_GMFIew3m";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export default supabase;