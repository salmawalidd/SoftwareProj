import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.replace("/rest/v1/", "").trim();
const supabaseKey = process.env.SUPABASE_KEY?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
