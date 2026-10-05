# xPostForecast

A reference full-stack web app used to teach CS 330 at West Virginia University. It maps **historical monthly average temperatures across West Virginia** from NOAA nClimGrid data, using a React + Leaflet frontend, a Node.js/Express backend, Azure Database for MySQL, and deployment to Azure.

> **This is a worked example, not a starter template.** Students build their own app, on their own topic, with the same stack and sprint structure, and use this repo to see what each finished sprint looks like.

## Sprints: one branch each

| Sprint | Branch | What it adds | What changed |
|--------|--------|--------------|--------------|
| 1 | [`sprint-1`](https://github.com/tdevine1/xPostForecast/tree/sprint-1) | React (Vite) frontend: Leaflet map and month/year selector | — |
| 2 | [`sprint-2`](https://github.com/tdevine1/xPostForecast/tree/sprint-2) | Express backend, Azure MySQL, login/registration with JWT cookies | [Sprint 1 → 2](https://github.com/tdevine1/xPostForecast/compare/sprint-1...sprint-2) |
| 3 | [`sprint-3`](https://github.com/tdevine1/xPostForecast/tree/sprint-3) | Real NOAA temperature data from the Planetary Computer STAC API | [Sprint 2 → 3](https://github.com/tdevine1/xPostForecast/compare/sprint-2...sprint-3) |
| 4 | [`main`](https://github.com/tdevine1/xPostForecast/tree/main) | Deployment to Azure Static Web Apps and App Service with GitHub Actions | [Sprint 3 → 4](https://github.com/tdevine1/xPostForecast/compare/sprint-3...main) |

Switch sprints with the branch dropdown on GitHub, or locally with `git switch sprint-2`. The **What changed** links show every file a sprint added or modified.

**Instructors:** the setup and deployment runbook is at **<https://tdevine1.github.io/xPostForecast/>** (source in [`docs/`](https://github.com/tdevine1/xPostForecast/tree/main/docs) on `main`).

---

# Sprint 1 – Frontend Setup

This sprint introduces frontend development with **Vite + React**. You will create your own GitHub repository and build your own app on the same stack, following the same sprint structure. The step-by-step walkthrough for setting up your own project is in [`frontend/README.md`](./frontend/README.md).

## ✅ Goal

By the end of Sprint 1, students will have:

- Installed the necessary tools (VS Code with the SQLTools extensions, Node.js 24 LTS, Git)
- Created their own GitHub repository and cloned it locally
- Scaffolded a working Vite + React app from scratch
- Built an interactive frontend appropriate to their chosen topic (this example uses a Leaflet map of West Virginia with a month/year selector)
- Run the app locally

## 🌍 Preview

Here's what *this reference example* looks like at the end of Sprint 1. Your app will look different since it's your own topic, but should follow the same structure:

![Sprint 1 Completed UI](./images/screenshot-sprint1.png)

The **Fetch Data** and **Logout** buttons are stubs in this sprint: they only log to the browser console. Sprint 2 implements logout and Sprint 3 fetches real data.

## 📂 What's in This Branch

```text
.
├── .github/workflows/ci.yml   # lint + test + build on every push
├── .vscode/extensions.json    # VS Code suggests the SQLTools extensions when you open the repo
├── frontend/                  # Vite + React app
│   ├── src/
│   │   ├── components/        # DateSelector.jsx (+ its test), MapComponent.jsx
│   │   ├── pages/             # MapPage.jsx
│   │   ├── App.jsx            # routes
│   │   └── main.jsx           # entry point
│   └── README.md              # step-by-step walkthrough
└── images/                    # screenshots used in the docs
```

## ▶️ Run This Reference App

Requires Node.js 24 LTS.

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run lint     # oxlint (the linter Vite's React template ships with)
npm test         # Vitest component tests
npm run build    # production build into dist/
```

## 🚀 Next Steps

In Sprint 2, you'll:
- Add a Node.js/Express backend
- Connect it to an Azure Database for MySQL
- Add registration, login, and logout
