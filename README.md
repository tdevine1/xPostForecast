# xPostForecast

A full-stack web app that maps **historical monthly average temperatures across West Virginia** from NOAA nClimGrid data. You register, log in, pick a month between January 1895 and September 2022, and the app paints about 9,700 colored squares over a street map.

It is built with a React + Leaflet frontend, a Node.js/Express backend, Azure Database for MySQL, and deployment to Azure with GitHub Actions. It is also the **worked example** for WVU's CS 330 course.

> **Two ways to use this repository**
>
> - **Run xPostForecast yourself:** this README and the READMEs in `frontend/` explain how the app works and how to set it up.
> - **Build your own project (CS 330 students):** don't copy this repo. Follow the [student guides](https://tdevine1.github.io/xPostForecast/), which teach each step for *your* topic, and use this repo to see what a finished version looks like. For this sprint, start with the [Sprint 1 guide](https://tdevine1.github.io/xPostForecast/students/sprint-1.html).
>
> **You are on the `sprint-1` branch**, which has the **frontend only**: a React (Vite) app with a Leaflet map and a month/year selector. Its buttons are stubs. The finished app, with deployment and code-quality checks, is on [`main`](https://github.com/tdevine1/xPostForecast/tree/main).

## The sprints: one branch each

The app was built in four stages, kept as branches so you can see how it grew:

| Sprint | Branch | What it adds | What changed | Student guide |
|--------|--------|--------------|--------------|---------------|
| 1 | [`sprint-1`](https://github.com/tdevine1/xPostForecast/tree/sprint-1) | React (Vite) frontend: Leaflet map and month/year selector | — | [Sprint 1](https://tdevine1.github.io/xPostForecast/students/sprint-1.html) |
| 2 | [`sprint-2`](https://github.com/tdevine1/xPostForecast/tree/sprint-2) | Express backend, Azure MySQL, login/registration with JWT cookies | [Sprint 1 → 2](https://github.com/tdevine1/xPostForecast/compare/sprint-1...sprint-2) | [Sprint 2](https://tdevine1.github.io/xPostForecast/students/sprint-2.html) |
| 3 | [`sprint-3`](https://github.com/tdevine1/xPostForecast/tree/sprint-3) | Real NOAA temperature data from the Planetary Computer STAC API | [Sprint 2 → 3](https://github.com/tdevine1/xPostForecast/compare/sprint-2...sprint-3) | [Sprint 3](https://tdevine1.github.io/xPostForecast/students/sprint-3.html) |
| 4 | [`main`](https://github.com/tdevine1/xPostForecast/tree/main) | Deployment to Azure with GitHub Actions, and SonarQube | [Sprint 3 → 4](https://github.com/tdevine1/xPostForecast/compare/sprint-3...main) | [Sprint 4](https://tdevine1.github.io/xPostForecast/students/sprint-4.html) |

Switch sprints with the branch dropdown on GitHub, or locally with `git switch sprint-2`. The **What changed** links show every file a sprint added or modified.

**Guides site:** **<https://tdevine1.github.io/xPostForecast/>** (source in [`docs/`](https://github.com/tdevine1/xPostForecast/tree/main/docs) on `main`) has a student guide for every sprint, the [instructor runbook](https://tdevine1.github.io/xPostForecast/instructors.html), and a [glossary](https://tdevine1.github.io/xPostForecast/glossary.html) of plain-English definitions.

---

# Sprint 1 – Frontend

The first stage of the app: a React frontend that runs on its own, with no backend or database yet.

![Sprint 1 Completed UI](./images/screenshot-sprint1.png)

The **Fetch Data** and **Logout** buttons are stubs in this sprint: they only write to the browser console. Sprint 2 implements logout and Sprint 3 fetches real data.

## What is in this branch

```text
.
├── .github/workflows/ci.yml   lint + test + build on every push
├── .vscode/extensions.json    VS Code suggests the optional SQLTools extensions when you open the repo
├── frontend/                  the Vite + React app  → frontend/README.md
│   └── src/
│       ├── components/        DateSelector.jsx (+ its test), MapComponent.jsx
│       ├── pages/             MapPage.jsx
│       ├── App.jsx            routes
│       └── main.jsx           entry point
└── images/                    screenshots used in the docs
```

## Run it on your computer

You need **Node.js 24 LTS** and **Git**.

```bash
git clone https://github.com/tdevine1/xPostForecast.git
cd xPostForecast
git switch sprint-1
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Run the checks any time with `npm run lint`, `npm test`, and `npm run build` in `frontend/`. How each part works is in the [frontend README](./frontend/README.md).

## What comes next

In [Sprint 2](https://github.com/tdevine1/xPostForecast/tree/sprint-2) the app gains an Express backend, an Azure MySQL database, and registration and login.

## License

MIT. See [LICENSE](./LICENSE).
