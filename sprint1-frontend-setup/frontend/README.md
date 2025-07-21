
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

- [Node.js & npm](https://nodejs.org/en/) – JavaScript runtime and package manager  
- [Git](https://git-scm.com/downloads) – Version control  
- [VS Code](https://code.visualstudio.com/) – Recommended code editor

---

## 2. 📂 Cloning the Repository

1. Open **VS Code**
2. Open the Command Palette: `Ctrl+Shift+P`
3. Type `Git: Clone` and hit Enter
4. Paste your repository URL (e.g., `https://github.com/your-name/xPostForecast`)
5. Open the folder: `sprint1-frontend-setup/frontend`

---

## 3. 🧠 Understanding the Project Structure

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

## 4. 📦 Installing Dependencies

Open your VS Code terminal (`Ctrl+\``) and run:

```bash
npm install
```

This installs the project dependencies defined in `package.json`.

---

## 5. 🚀 Running the Development Server

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

## 6. 🧪 What Should It Look Like?

Here’s a sample screenshot of the app at the end of Sprint 1:

![Sprint 1 UI](screenshot.png)

- Map is visible using Leaflet
- Month/year dropdowns shown
- “Fetch Data” and “Logout” buttons are present
- No real data fetch or login logic yet

---

## 7. 💡 Explore More (Optional Learning)

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
