// frontend/js/auth.js

const msg = document.getElementById("msg"); // ensure <p id="msg"></p> exists in auth.html

function showMsg(text, isError = false) {
  if (!msg) return;
  msg.textContent = text;
  msg.className = isError
    ? "text-sm text-red-600 mt-2"
    : "text-sm text-green-700 mt-2";
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // show backend error if present
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? (el.value || "").trim() : "";
}

// --------------------------
// LOGIN
// --------------------------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const email = getVal("loginEmail");
    const password = document.getElementById("loginPassword")?.value || "";

    if (!email || !password) {
      showMsg("Enter email and password.", true);
      return;
    }

    showMsg("Signing in...");
    const data = await postJSON("/api/auth/login", { email, password });

    if (!data?.session) throw new Error("Invalid login response (no session).");

    // store session
    localStorage.setItem("session", JSON.stringify(data.session));

    // ✅ IMPORTANT: route by role
    const isAdmin = !!data.session.is_admin;

    showMsg("Login successful. Redirecting...");
    window.location.href = isAdmin ? "/admin" : "/app";
  } catch (err) {
    showMsg(err?.message || String(err), true);
  }
});

// --------------------------
// SIGNUP
// --------------------------
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const name = getVal("signupName");
    const phone = getVal("signupPhone");
    const email = getVal("signupEmail");
    const password = document.getElementById("signupPassword")?.value || "";
    const confirm = document.getElementById("signupConfirm")?.value || "";

    if (!name || !email || !password) {
      throw new Error("Please fill all required fields.");
    }
    if (password !== confirm) {
      throw new Error("Passwords do not match.");
    }

    showMsg("Creating account...");
    await postJSON("/api/auth/signup", { name, phone, email, password });

    showMsg(
      "Account created. Waiting for admin approval. You can log in after approval."
    );

    // optional: clear fields
    // document.getElementById("signupForm").reset();
    // optional: switch to login tab (only if you have a function)
    // openTab("login");
  } catch (err) {
    showMsg(err?.message || String(err), true);
  }
});

// --------------------------
// FORGOT PASSWORD
// --------------------------
document.getElementById("forgotForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const email = getVal("forgotEmail");
    if (!email) {
      showMsg("Enter your email.", true);
      return;
    }

    showMsg("Sending reset link...");
    await postJSON("/api/auth/recover", { email });

    showMsg("Reset link sent (check inbox/spam).");
  } catch (err) {
    showMsg(err?.message || String(err), true);
  }
});
