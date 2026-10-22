# WVU Cloud Deployment Docs

## Purpose
This folder is a small static website documenting how to set up and deploy the xPostForecast course project to the cloud using the WVU workflow.

Published with GitHub Pages at **<https://tdevine1.github.io/xPostForecast/>** (Settings → Pages → Deploy from a branch → `main` / `/docs`). The empty `.nojekyll` file tells GitHub Pages to serve the HTML as-is.

## What This Is For
The site has two audiences, chosen from the landing page (`index.html`):

- **Instructors** (`instructors.html` and the numbered pages it links to): a step-by-step reference for WVU professors, instructors, and staff covering project setup, GitHub configuration, Azure deployment, and troubleshooting for CS 330.
- **Students** (`students/`): `ai-guide.html`, on using AI tools like a professional developer while still learning the fundamentals. Its sidebar also links to the Google Doc setup guides.

## Layout
| File | Purpose |
|---|---|
| `index.html` | Landing page: choose the instructor or student guides |
| `instructors.html` | Instructor home |
| `getting-started.html`, `github-setup.html`, `azure-basics.html`, `deployment-steps.html`, `troubleshooting.html` | Instructor guide pages |
| `students/ai-guide.html` | Student guide: developing with AI (includes a small prompt builder written in plain JavaScript) |
| `site.css` | The one stylesheet every page uses |

## Editing
Plain HTML and one stylesheet (`site.css`); no build step. Open `index.html` in a browser to preview. When code or a student guide changes, update the matching page here in the same commit.

## Authorship
The instructor documentation was created by Grace Hanson under Tom Devine at West Virginia University (WVU). It began as its own repository, [HansonGrace/CloudDeployment-Docs](https://github.com/HansonGrace/CloudDeployment-Docs), and was moved here with its commit history.
