export const config = { runtime: "nodejs" };

import { supabaseAnon } from "../../_utils/supabaseClient.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Missing email/password" });

    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const adminPass  = (process.env.ADMIN_PASSWORD || "").trim();
    const isAdmin = email.toLowerCase().trim() === adminEmail && password === adminPass;

    // Admin login (no supabase auth required)
    if (isAdmin) {
      return res.json({
        ok: true,
        session: {
          is_admin: true,
          user: { id: "admin", email, name: "Admin" }
        }
      });
    }

    // Normal user login via Supabase
    const supabase = supabaseAnon();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    return res.json({
      ok: true,
      session: {
        is_admin: false,
        user: {
          id: data.user.id,
          email: data.user.email
        },
        access_token: data.session?.access_token || null
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Login failed" });
  }
}
