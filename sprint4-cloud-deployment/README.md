# Sprint 4 – Cloud Deployment (Instructor-Provisioned Resources)

In Sprint 4, your team will deploy the xPostForecast full-stack application to the Microsoft Azure cloud **using cloud resources already created for your group by the instructor**.

You have been working with your group’s **Azure MySQL database since Sprint 2**, and in this sprint you will connect your **cloud backend** and **cloud frontend** to that same database through:

- A **Static Web App (SWA)** for the React frontend  
- An **App Service (Web App for Linux)** for the Node.js backend  
- The existing **Azure MySQL Flexible Server database**

The instructor acts as the Cloud Administrator (creating the resources); your team acts as the DevOps / Software Engineering team (configuring, deploying, debugging).

---

## 📁 Sprint 4 Folder Layout

This folder contains all Sprint 4-specific code and documentation:

```text
sprint4-cloud-deployment/
│
├── README.md                 ← Overview (this file)
│
├── frontend/
│   └── README.md             ← Static Web App (SWA) configuration & deployment
│
├── backend/
│   └── README.md             ← App Service configuration & deployment
│
└── images/                   ← Screenshots used in these READMEs
```

You will place screenshots (taken from *your* group’s Azure resources and GitHub repo) into the `images/` directory and they will be referenced from these READMEs.

Example (top-level) screenshot reference:

![Resource Group Overview](./images/resource-group-overview.png)

---

## 🧑‍🏫 What the Instructor Has Already Created (Per Group)

For each group, the instructor has **already** created and wired up:

### 1. Static Web App (SWA) – Frontend
- A Static Web App resource in Azure  
- Correct region, plan, and resource group  
- Initial GitHub connection to your group’s repository and branch  

The SWA is ready for your group to **configure secrets** and **trigger deployments**.

---

### 2. App Service (Web App for Linux) – Backend
- A dedicated App Service instance for your backend API  
- Correct runtime stack (Node.js) and plan  
- Placement in your group’s resource group  

You will configure:
- Application Settings (environment variables)  
- Deployment via GitHub Actions using a publish profile  

---

### 3. Azure MySQL Flexible Server – Database (Existing Since Sprint 2)
- A database server and database created in Sprint 2  
- Credentials and connection parameters provided earlier  
- Network configuration and SSL settings that are already working for your local development

You do **not** create or modify the database infrastructure in Sprint 4. You simply configure your backend to use the same host / DB / user / password in the **App Service** environment variables.

---

## 🎯 Student / Team Responsibilities in Sprint 4

Your group’s responsibilities now are:

1. **App Service (backend) configuration**
   - Configure the environment variables (DB, JWT, FRONTEND_URL, etc.)
   - Download your own publish profile and store it as a GitHub secret
   - Verify the backend deployment via `/health`

2. **Static Web App (frontend) configuration**
   - Add the backend URL as a GitHub Actions secret
   - Confirm the SWA workflow uses the correct `app_location` and `output_location`
   - Validate that the deployed frontend calls your cloud backend

3. **GitHub Actions YAML verification**
   - Ensure the **backend** workflow uses the correct `working-directory`, `package` paths, Node version, and secret name
   - Ensure the **frontend/SWA** workflow points to `sprint4-cloud-deployment/frontend`, sets `VITE_BACKEND_API_URL` via secrets, and fixes any `app_location` issues in secondary jobs

4. **End-to-end validation**
   - Confirm that the deployed frontend and backend work together using the existing database  
   - Use browser dev tools and the Azure Log Stream to investigate any issues

There are **no grading criteria or LMS instructions in this README**; refer to your course LMS for Sprint 4 deliverables and rubric.

---

## 🆕 Conceptual Changes from Sprint 3 → Sprint 4

### Backend (App Service)
- Moves from local Node.js server to Azure App Service
- Uses `PORT = process.env.PORT || 5175` to adapt to cloud
- Uses App Service **Application Settings** instead of a local `.env` for:
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `FRONTEND_URL`
  - `JWT_SECRET`
  - `NODE_ENV`
- Uses a **publish profile** secret in GitHub Actions to deploy on push
- Connects to the same Azure MySQL DB used since Sprint 2 (with SSL)

### Frontend (Static Web App)
- Moves from local `npm run dev` to deployment on SWA
- Uses `VITE_BACKEND_API_URL` from GitHub Secrets
- Has an automatically-generated GitHub Actions workflow for CI/CD

### CI/CD & Configuration
- Students now manage pipeline configuration and secrets for:
  - Backend App Service deployment
  - Frontend SWA deployment

---

## 📄 Where to Go Next

- See [`frontend/README.md`](./frontend/README.md) for:
  - Static Web App config
  - Frontend GitHub Actions behavior
  - SWA-related screenshots

- See [`backend/README.md`](./backend/README.md) for:
  - App Service environment variables
  - Backend GitHub Actions workflow
  - Health checks and diagnostics

Consult your LMS assignment in parallel to know what you are expected to demonstrate for Sprint 4.
