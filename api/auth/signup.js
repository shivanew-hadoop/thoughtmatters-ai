// /api/auth/signup.js
import { supabaseAnon, supabaseAdmin } from "../../_utils/supabaseClient.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    const { name, phone, email, password } = req.body || {};

    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    // 1. Create user in Supabase Auth
    const sb = supabaseAnon();
    const { data, error } = await sb.auth.signUp({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    const user_id = data.user.id;

    // 2. Insert profile into user_profiles
    const admin = supabaseAdmin();
    const { error: insertErr } = await admin.from("user_profiles").insert({
      id: user_id,
      name,
      phone,
      email,
      approved: false,
      credits: 0,
    });

    if (insertErr)
      return res.status(400).json({ error: insertErr.message });

    return res.status(200).json({
      ok: true,
      message: "Account created. Waiting for admin approval.",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
