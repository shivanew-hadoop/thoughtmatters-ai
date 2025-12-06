// /api/auth/login.js
import { supabaseAnon, supabaseAdmin } from "../../_utils/supabaseClient.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: "Missing email/password" });

    // ============================================================
    // 1. ADMIN LOGIN CHECK
    // ============================================================
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

    const isAdminLogin =
      email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    if (isAdminLogin) {
      return res.status(200).json({
        ok: true,
        session: {
          is_admin: true,
          user_id: "admin",
          email: ADMIN_EMAIL,
        },
      });
    }

    // ============================================================
    // 2. NORMAL USER LOGIN (Supabase)
    // ============================================================
    const sb = supabaseAnon();
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    const user_id = data.user.id;

    // ============================================================
    // 3. GET USER PROFILE FROM SUPABASE
    // ============================================================
    const admin = supabaseAdmin();
    const { data: profile, error: profErr } = await admin
      .from("user_profiles")
      .select("approved, credits, name, phone, created_at")
      .eq("id", user_id)
      .single();

    if (profErr)
      return res.status(400).json({ error: "Profile missing for user" });

    // ============================================================
    // 4. CHECK APPROVAL
    // ============================================================
    if (!profile.approved) {
      return res.status(403).json({
        error: "Your account is waiting for admin approval",
      });
    }

    // ============================================================
    // 5. RETURN STANDARD USER SESSION FORMAT
    // ============================================================
    return res.status(200).json({
      ok: true,
      session: {
        is_admin: false,
        user_id,
        email,
        credits: profile.credits,
        name: profile.name,
        phone: profile.phone,
      },
    });

  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || "Internal error in login API" });
  }
}
