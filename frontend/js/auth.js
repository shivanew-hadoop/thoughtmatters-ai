// ===============================
// ELEMENTS
// ===============================
const statusBox = document.getElementById("statusBox");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotForm = document.getElementById("forgotForm");

const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const tabForgot = document.getElementById("tabForgot");

// ===============================
// STATUS MESSAGES
// ===============================
function showMsg(text, isError = false) {
  statusBox.textContent = text;
  statusBox.className = isError
    ? "text-sm text-red-600 mb-4"
    : "text-sm text-green-700 mb-4";
  statusBox.classList.remove("hidden");
}

function clearMsg() {
  statusBox.classList.add("hidden");
  statusBox.textContent = "";
}

// ===============================
// TAB HANDLING
// ===============================
function showTab(tab) {
  clearMsg();

  loginForm.classList.add("hidden");
  signupForm.classList.add("hidden");
  forgotForm.classList.add("hidden");

  tabLogin.classList.remove("border-blue-700", "text-blue-700");
  tabSignup.classList.remove("border-blue-700", "text-blue-700");
  tabForgot.classList.remove("border-blue-700", "text-blue-700");

  if (tab === "login") {
    loginForm.classList.remove("hidden");
    tabLogin.classList.add("border-b-2", "border-blue-700", "text-blue-700");
  }
  if (tab === "signup") {
    signupForm.classList.remove("hidden");
    tabSignup.classList.add("border-b-2", "border-blue-700", "text-blue-700");
  }
  if (tab === "forgot") {
    forgotForm.classList.remove("hidden");
    tabForgot.classList.add("border-b-2", "border-blue-700", "text-blue-700");
  }
}

tabLogin.onclick = () => showTab("login");
tabSignup.onclick = () => showTab("signup");
tabForgot.onclick = () => showTab("forgot");

// default tab
showTab("login");

// ===============================
// API HELPER
// ===============================
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

function val(id) {
  return (document.getElementById(id)?.value || "").trim();
}

// ===============================
// LOGIN
// ===============================
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    clearMsg();

    const email = val("loginEmail");
    const password = val("loginPassword");

    if (!email || !password) return showMsg("Enter email & password", true);

    showMsg("Signing in...");

    const data = await postJSON("/api/auth/login", { email, password });

    if (!data.session) throw new Error("Invalid session response");

    localStorage.setItem("session", JSON.stringify(data.session));

    const isAdmin = data.session?.is_admin === true;

    showMsg("Login successful. Redirecting...");

    window.location.href = isAdmin ? "/admin" : "/app";
  } catch (err) {
    showMsg(err.message, true);
  }
});

// ===============================
// SIGNUP
// ===============================
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    clearMsg();

    const name = val("signupName");
    const phone = val("signupPhone");
    const email = val("signupEmail");
    const password = val("signupPassword");

    if (!name || !email || !password) {
      return showMsg("Fill all required fields.", true);
    }

    showMsg("Creating account...");

    await postJSON("/api/auth/signup", {
      name,
      phone,
      email,
      password,
    });

    showMsg(
      "Account created. Waiting for admin approval. Try logging in after approval."
    );

    showTab("login");
  } catch (err) {
    showMsg(err.message, true);
  }
});

// ===============================
// FORGOT
// ===============================
forgotForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    clearMsg();

    const email = val("forgotEmail");
    if (!email) return showMsg("Enter email", true);

    showMsg("Sending reset link...");

    await postJSON("/api/auth/recover", { email });

    showMsg("Reset link sent. Check your inbox/spam.");
  } catch (err) {
    showMsg(err.message, true);
  }
});
