# WVU Cloud Deployment Docs

## Purpose
This folder is a small static website documenting how to set up and deploy the xPostForecast course project to the cloud using the WVU workflow.

Published with GitHub Pages at **<https://tdevine1.github.io/xPostForecast/>** (Settings → Pages → Deploy from a branch → `main` / `/docs`). The empty `.nojekyll` file tells GitHub Pages to serve the HTML as-is.

## What This Is For
The site has two audiences, chosen from the landing page (`index.html`):

- **Instructors** (`instructors.html` and the numbered pages it links to): a step-by-step reference for WVU professors, instructors, and staff covering project setup, GitHub configuration, Azure deployment, and troubleshooting for CS 330.
- **Students** (`students/`): `ai-guide.html`, on using AI tools like a professional developer while still learning the fundamentals, `sonarqube.html`, a tutorial for connecting a team repository to SonarQube Cloud (Milestone 6), `github-workflows.html`, on writing GitHub Actions workflows, and `sprint-4.html`, on deploying a team project to Azure. Their sidebars also link to the Google Doc setup guides.

## Layout
| File | Purpose |
|---|---|
| `index.html` | Landing page: choose the instructor or student guides |
| `instructors.html` | Instructor home |
| `getting-started.html`, `github-setup.html`, `azure-basics.html`, `deployment-steps.html`, `troubleshooting.html` | Instructor guide pages |
| `azure-scripts.html`, `scripts/` | Instructor guide page and the downloadable PowerShell scripts (MySQL servers, App Services, Static Web Apps, access, cleanup). Scripts are parameterized: no passwords or student e-mails are stored in them |
| `glossary.html` | Plain-English definitions of the Azure, GitHub, and web terms used in every guide; linked from each sidebar |
| `students/ai-guide.html` | Student guide: developing with AI (includes a small prompt builder written in plain JavaScript) |
| `students/sprint-4.html` | Student guide: deploy your own project to Azure (what to change in the code, App Service settings, GitHub secrets, the two deploy workflows, a live-site checklist, and a symptom/fix table). Matches the Sprint 4 code on `main`. Screenshots are in `docs/images/` |
| `students/sonarqube.html` | Student guide: SonarQube Cloud setup, coverage reports, the CI job, and using the results in the Milestone 6 report. Matches `sonar-project.properties` and the `sonar` job in `.github/workflows/ci.yml` |
| `students/github-workflows.html` | Student guide: write your own GitHub Actions workflows (CI, deploy backend, deploy frontend) with every line explained. The snippets match the real workflows in `.github/workflows/` |
| `site.css` | The one stylesheet every page uses |

## Editing
Plain HTML and one stylesheet (`site.css`); no build step. Open `index.html` in a browser to preview. When code or a student guide changes, update the matching page here in the same commit.

## Authorship
The instructor documentation was created by Grace Hanson under Tom Devine at West Virginia University (WVU). It began as its own repository, [HansonGrace/CloudDeployment-Docs](https://github.com/HansonGrace/CloudDeployment-Docs), and was moved here with its commit history.
