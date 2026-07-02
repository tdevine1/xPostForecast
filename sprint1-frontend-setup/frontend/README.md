
# Sprint 1: Frontend Setup Guide for xPostForecast

Welcome to Sprint 1 of the **xPostForecast** project! In this phase, you'll build a basic React front end using [Vite](https://vitejs.dev/), connect VS Code to GitHub, and preview a Leaflet map with a date selector UI. This sprint focuses on learning how front-end development is structured and how modern dev tools help streamline the process.

---

## 🧰 What You’ll Learn

- How to clone and set up a Vite-powered React project
- Understanding the frontend folder and component structure
- How routing works using React Router
- How to run the local development server with hot reloading

---

## 1. 🔧 Prerequisites

Make sure the following are installed:

- [Node.js & npm](https://nodejs.org/en/) – JavaScript runtime and package manager. Install the **LTS version (18 or later)** — this project won't run correctly on older versions.
- [Git](https://git-scm.com/downloads) – Version control  
- [VS Code](https://code.visualstudio.com/) – Recommended code editor
- A [GitHub](https://github.com/) account

---

## 2. 🍴 Get Your Own Copy of the Repo

You'll work from your own copy of the class repo, not the shared one directly.

1. Go to the class repo on GitHub (your instructor will give you the link).
2. Click **Fork** (top right) to create a copy under your own GitHub account. Keep the repository name as `xPostForecast`.
3. You now have your own repo at `https://github.com/<your-username>/xPostForecast` — use this URL in the next step, not the original.

---

## 3. 📂 Cloning the Repository

1. Open **VS Code**
2. Open the Command Palette: `Ctrl+Shift+P`
3. Type `Git: Clone` and hit Enter
4. Paste **your fork's** URL (e.g., `https://github.com/your-username/xPostForecast`)
5. Open the folder: `sprint1-frontend-setup/frontend`

---

## 4. 🧠 Understanding the Project Structure

```bash
frontend/
└── src/
    ├── components/     # Reusable pieces like MapComponent and DateSelector
    ├── pages/          # Pages tied to routes (e.g., MapPage.jsx)
    ├── App.jsx         # Main app routing component
    ├── main.jsx        # Entry point for rendering App
    └── index.css       # Global styles
```

**Mini-Lesson: Why split components and pages?**  
`components/` are reusable widgets (like buttons or selectors).  
`pages/` are full screens (like "MapPage") that use multiple components.

---

## 5. 📦 Installing Dependencies

Open your VS Code terminal (`Ctrl+\``) and run:

```bash
npm install
```

This installs the project dependencies defined in `package.json`.

---

## 6. 🚀 Running the Development Server

In the terminal:

```bash
npm run dev
```

This launches the Vite development server. Your terminal will show something like:

```
  ➜  Local:   http://localhost:5173/
```

Visit that URL in your browser to see the app.

**Mini-Lesson: What is hot reloading?**  
When you edit a file, the page updates instantly without reloading. This is Vite’s superpower!

---

## 7. 🧪 What Should It Look Like?

Here’s a sample screenshot of the app at the end of Sprint 1:

![Sprint 1 UI](../images/screenshot-sprint1.png)

- Map is visible using Leaflet
- Month/year dropdowns shown
- “Fetch Data” and “Logout” buttons are present
- No real data fetch or login logic yet

---

## 8. 🛠️ Troubleshooting

- **`npm install` fails or hangs** — delete `node_modules/` and `package-lock.json`, then re-run `npm install`. Make sure you're inside `sprint1-frontend-setup/frontend` when you run it.
- **`npm` or `node` not recognized** — Node.js isn't installed or isn't on your PATH. Reinstall Node.js and restart VS Code.
- **`Port 5173 is already in use`** — another instance of the dev server is already running. Stop it (`Ctrl+C` in that terminal) or close other terminal tabs running `npm run dev`.
- **Map doesn't render / blank page** — open your browser's developer console (`F12`) and check for errors; a common cause is a typo in an import path under `src/components/`.

---

## 9. 💡 Explore More (Optional Learning)

| Topic | Resource |
|-------|----------|
| Learn JSX | [React: Introducing JSX](https://reactjs.org/docs/introducing-jsx.html) |
| Learn React Router | [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial) |
| Learn Vite | [Vite Docs](https://vitejs.dev/guide/) |

---

## ✅ You Now Have

- Cloned the repo and opened it in VS Code
- Installed dependencies
- Explored the folder structure
- Previewed the frontend in your browser

In **Sprint 2**, we’ll add a backend connection and a database for login functionality.

Happy coding!


---

## 🛑 Don't Forget: Check Your `.gitignore`

Because you forked the full `xPostForecast` repo, you already have a `.gitignore` at the repo root (`xPostForecast/.gitignore`) that excludes `node_modules/`, `.env`, `dist/`, and other files you never want committed — you don't need to create a new one in `frontend/`.

Before you run `git add`, it's still worth double-checking with `git status` that nothing like `node_modules/` or a `.env` file is about to be committed. If it is, verify the root `.gitignore` covers it rather than adding a second `.gitignore` file.
