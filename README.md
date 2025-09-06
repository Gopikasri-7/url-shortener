# 🔗 URL Shortener – Simple & Secure

A JavaScript-based web application that allows users to shorten long URLs, manage them, and copy/share easily. Includes secure login/registration with SHA-256 password hashing and persistent storage using localStorage.

---

## 🚀 Features

### Core Functionality
* 🌐 **URL Shortening** – Convert long URLs to short, easy-to-share links
* 🖥 **Dashboard** – View all your shortened URLs with original links
* ✂️ **Copy-to-Clipboard** – One-click copy for sharing short links
* 🗑 **Delete Links** – Remove any URL with confirmation prompt
* 🔐 **Secure Login/Registration** – Passwords hashed with SHA-256

### Technical Features
* 💾 **LocalStorage-based** – Saves users and URLs persistently
* ⏱ **Instant Updates** – Dashboard refreshes immediately after changes
* 🧩 **Input Validation** – Prevents duplicate URLs and validates format
* 📝 **Simple & Clean UI** – Responsive, minimal design

---

## 🛠 Technologies Used

| Technology | Purpose |
|------------|---------|
| 🌐 HTML5 | Structure of web pages |
| 🎨 CSS3 | Styling & layout |
| ⚡ JavaScript | Core functionality & interactivity |
| 🔐 SHA-256 via crypto.subtle | Secure password hashing |
| 💾 localStorage | Persistent storage for users & URLs |

---

## 📂 Project Structure

```
url-shortener/
├── index.html       # Main HTML file (login, register, dashboard)
├── style.css        # Styles for layout, buttons, dashboard
├── script.js        # All JS logic: auth, URL shortening, copy/delete
└── README.md        # Project documentation
```

---

## 🖥 How It Works

1. Open `index.html` → Login or Register
2. After login → Enter a long URL in the dashboard
3. Click "Shorten" → See your shortened URL
4. Copy link using Copy button
5. Manage all URLs → Delete unwanted ones with confirmation
6. Logout → Safe exit with token cleared

---

## 🎯 Perfect For

| User Type | Use Case |
|-----------|----------|
| 🎓 Students | Learn frontend JS & auth logic |
| 🖥 Developers | Quick URL shortening tool |
| 💼 Interview Prep | Demonstrating JS & localStorage usage |
| 📚 Hobbyists | Easy personal URL manager |]             |
--------------------------


## 🔒 Security Notes

* **Passwords are hashed** before saving → safer than plain text
* **URLs are validated** → prevents invalid entries
* **Copy button shows confirmation** message for UX clarity
