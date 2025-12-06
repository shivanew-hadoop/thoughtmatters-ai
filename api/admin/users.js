import { supabaseAdmin } from "../_utils/supabaseClient.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") 
      return res.status(405).json({ error: "Method not allowed" });

    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from("user_profiles")
      .select("user_id,name,email,phone,approved,credits,created_at")
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ users: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
