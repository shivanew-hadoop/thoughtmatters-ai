import { supabaseAdmin } from "../../../_utils/supabaseClient.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    const { user_id } = req.body || {};

    if (!user_id)
      return res.status(400).json({ error: "user_id required" });

    const sb = supabaseAdmin();

    // Get current credits
    const { data: row, error: e1 } = await sb
      .from("user_profiles")
      .select("credits")
      .eq("id", user_id)
      .single();

    if (e1) return res.status(400).json({ error: e1.message });

    const newCredits = Math.max(0, row.credits - 1);

    const { data, error: e2 } = await sb
      .from("user_profiles")
      .update({ credits: newCredits })
      .eq("id", user_id)
      .select()
      .single();

    if (e2) return res.status(400).json({ error: e2.message });

    return res.json({ ok: true, credits: data.credits });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
