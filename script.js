const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const dashboard = document.getElementById("dashboard");
const urlForm = document.getElementById("url-form");
const urlsList = document.getElementById("urls-list");
const shortUrlDisplay = document.getElementById("short-url-display");
const messageBox = document.getElementById("message");

const USERS_KEY = "users";
const URL_MAP_KEY = "url_map";
let currentUser = null;

function showMessage(msg, type) {
  messageBox.textContent = msg;
  messageBox.className = type ? type : "";
  if (msg) setTimeout(() => { messageBox.textContent = ""; messageBox.className = ""; }, 3000);
}

function toggleForm(form) {
  showMessage("");
  if (form === "login") {
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
    dashboard.style.display = "none";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
    dashboard.style.display = "none";
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function isLikelyHash(s) {
  return typeof s === "string" && /^[0-9a-f]{64}$/.test(s);
}

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function normalizeUrl(input) {
  try {
    new URL(input);
    return input;
  } catch {
    try {
      const pref = "https://" + input;
      new URL(pref);
      return pref;
    } catch {
      return null;
    }
  }
}

function getUserUrls(email) {
  return JSON.parse(localStorage.getItem("urls_" + email) || "[]");
}
function saveUserUrls(email, urls) {
  localStorage.setItem("urls_" + email, JSON.stringify(urls));
}

function getUrlMap() {
  return JSON.parse(localStorage.getItem(URL_MAP_KEY) || "{}");
}
function saveUrlMap(map) {
  localStorage.setItem(URL_MAP_KEY, JSON.stringify(map));
}

function generateShort() {
  return "short.ly/" + Math.random().toString(36).substring(2, 8);
}

function loadUrls() {
  if (!currentUser) return;
  const urls = getUserUrls(currentUser);
  urlsList.innerHTML = "";
  urls.forEach((url, idx) => {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.style.flex = "1";
    left.style.overflow = "hidden";

    const a = document.createElement("a");
    a.href = url.long;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = url.short;

    const br = document.createElement("br");
    const small = document.createElement("small");
    small.style.color = "gray";
    small.textContent = url.long;

    left.appendChild(a);
    left.appendChild(br);
    left.appendChild(small);

    const right = document.createElement("div");

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => copyToClipboard(url.long));

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteUrl(idx));

    right.appendChild(copyBtn);
    right.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(right);
    urlsList.appendChild(li);
  });
}

function deleteUrl(index) {
  if (!currentUser) return;
  if (!confirm("Are you sure you want to delete this link?")) return;
  const urls = getUserUrls(currentUser);
  const removed = urls.splice(index, 1);
  saveUserUrls(currentUser, urls);

  const map = getUrlMap();
  if (removed[0] && map[removed[0].short]) {
    delete map[removed[0].short];
    saveUrlMap(map);
  }

  loadUrls();
  showMessage("✅ Link deleted", "success");
}

function copyToClipboard(text) {
  if (!navigator.clipboard) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showMessage("✅ Copied to clipboard!", "success");
    } catch {
      showMessage("Copy failed", "error");
    }
    document.body.removeChild(ta);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showMessage("✅ Copied to clipboard!", "success");
  }).catch(() => {
    showMessage("Copy failed", "error");
  });
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) { showMessage("Enter email & password", "error"); return; }

  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    showMessage("User not found. Please register first.", "error");
    return;
  }

  const passwordHash = await hashPassword(password);

  if (isLikelyHash(user.password)) {
    if (user.password !== passwordHash) {
      showMessage("Invalid credentials! Please try again.", "error");
      return;
    }
  } else {
    if (user.password === password) {
      user.password = passwordHash;
      saveUsers(users);
    } else {
      showMessage("Invalid credentials! Please try again.", "error");
      return;
    }
  }

  currentUser = email;
  localStorage.setItem("token", btoa(email + ":" + passwordHash));
  showDashboard();
  showMessage("✅ Login successful!", "success");
  loginForm.reset();
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  if (!email || !password) { showMessage("Enter email & password", "error"); return; }

  const users = getUsers();
  if (users.some(u => u.email === email)) {
    showMessage("This email is already registered.", "error");
    return;
  }
  const hashed = await hashPassword(password);
  users.push({ email, password: hashed });
  saveUsers(users);
  showMessage("✅ Registered successfully! You can now login.", "success");
  registerForm.reset();
  setTimeout(() => toggleForm("login"), 900);
});

function showDashboard() {
  loginForm.style.display = "none";
  registerForm.style.display = "none";
  dashboard.style.display = "block";
  shortUrlDisplay.innerHTML = "";
  loadUrls();
}

urlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentUser) { showMessage("Please login first", "error"); return; }

  const raw = document.getElementById("long-url").value.trim();
  const normalized = normalizeUrl(raw);
  if (!normalized) { showMessage("❌ Please enter a valid URL", "error"); return; }

  const urls = getUserUrls(currentUser);
  if (urls.some(u => u.long === normalized)) { showMessage("⚠️ URL already shortened", "error"); return; }

  let short;
  const map = getUrlMap();
  do {
    short = generateShort();
  } while (map[short]);

  urls.push({ long: normalized, short });
  saveUserUrls(currentUser, urls);

  map[short] = normalized;
  saveUrlMap(map);

  shortUrlDisplay.innerHTML = "";
  const a = document.createElement("a");
  a.href = normalized;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = short;
  const copyButton = document.createElement("button");
  copyButton.className = "copy-btn";
  copyButton.textContent = "Copy";
  copyButton.style.marginLeft = "8px";
  copyButton.addEventListener("click", () => copyToClipboard(normalized));
  shortUrlDisplay.appendChild(a);
  shortUrlDisplay.appendChild(copyButton);

  loadUrls();
  urlForm.reset();
  showMessage("✅ URL shortened", "success");
});

function logout() {
  localStorage.removeItem("token");
  currentUser = null;
  urlsList.innerHTML = "";
  shortUrlDisplay.innerHTML = "";
  toggleForm("login");
  showMessage("✅ Logged out successfully.", "success");
}

function tryAutoLogin() {
  const tok = localStorage.getItem("token");
  if (!tok) { toggleForm("login"); return; }
  try {
    const decoded = atob(tok);
    currentUser = decoded.split(":")[0] || decoded;
    showDashboard();
  } catch {
    toggleForm("login");
  }
}

tryAutoLogin();
