# WV Historical Temperature Viewer (Teaching Demo)

This repository contains a staged, instructional full-stack web application that demonstrates how to build, deploy, and secure a cloud-connected weather visualization app using **React**, **Node.js**, **MySQL**, and **Azure**.

The app displays **historical monthly average temperatures** across West Virginia using NOAA climate data. It includes user authentication, a map-based frontend, and cloud-backed services.

![App Screenshot](./screenshot1.png)

---

## 🎓 Purpose

This repo is designed to **teach full-stack web app development** in an undergraduate course setting. Students progress through three versions of the application, each aligned with a two-week development sprint:

### 🔁 Versions

| Version | Description |
|---------|-------------|
| **v1-login-only** | Local frontend with basic login; connects to Azure-hosted MySQL database |
| **v2-registration-db** | Adds registration and user validation; refactors backend |
| **v3-full-stack** | Deploys frontend to Azure Static Web App and backend to Azure App Service; consumes NOAA data |

---

## 🧱 Tech Stack

- **Frontend**: React, Leaflet, Axios, .env for config
- **Backend**: Node.js, Express, MySQL2, JWT, bcrypt
- **Database**: Azure Database for MySQL
- **Deployment**: Azure App Service, Azure Static Web Apps, GitHub Actions

---

## 🗺️ Features

- Interactive map with historical temperature overlays
- NOAA grid cell data using STAC API
- Secure user login with JWT
- Responsive interface with dropdown selectors for year/month
- Deployed using CI/CD pipelines

---

## 🚀 Getting Started

Each version lives in its own subdirectory. To start with version 1:

```bash
cd version1-login-only
cd frontend && npm install && npm start
cd ../backend && npm install && node app.js
```

Be sure to configure the `.env` files in both frontend and backend folders.

---

## 📁 Repo Structure

```
wv-temperature-map-demo/
├── version1-login-only/
├── version2-registration-db/
├── version3-full-stack/
├── shared/                # Common docs, assets, or config templates
├── .github/               # CI/CD workflows
├── screenshot1.png
└── README.md
```

---

## 🔐 Auth Workflow

Users must log in to view the temperature map. Credentials are validated against the `users` table in a secure MySQL database. JWTs are used for session management, and all secrets are managed via environment variables or Azure App Service config.

---

## 📊 Data Source

Data is derived from NOAA's **nClimGrid** collection via Microsoft's Planetary Computer and the STAC API interface. This provides accurate, gridded climate data going back to 1951.

---

## 🧑‍🏫 For Instructors

This project is built to align with sprint-based teaching. You can assign one version per sprint and use it to teach:

- GitHub project setup & version control
- CI/CD with GitHub Actions
- Frontend/backend decoupling
- API development & data fetching
- Cloud deployment & service integration

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.
