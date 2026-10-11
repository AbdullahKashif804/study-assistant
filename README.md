# Study Assistant

A MERN study-management application for notes, assignments, projects, courses,
quizzes, daily tasks and to-do tasks, with AI assistance and responsive light/dark UI.

## Documentation

- [Security and backend safeguards](docs/SECURITY.md): authentication limits,
  validation, password hashing, startup readiness and account-deletion recovery.
- [Cloudinary operations](docs/CLOUDINARY.md): authenticated access, replacement,
  temporary cleanup, diagnostics and legacy migration/recovery.
- [AI features and limits](docs/AI.md): Summary, Quiz, RAG and Study Planner budgets.
- [Frontend guide](docs/FRONTEND.md): shared layouts, colors, drafts and browser checks.
- [Historical project audit](PROJECT_AUDIT.md): dated findings and separate follow-up status.

## Features

- Signup, login, JWT authentication, six-digit email verification, resend, password
  change, profile management, profile images and explicitly confirmed account deletion.
- Seven CRUD study modules, course relationships, assignment/project marks,
  task completion, deadlines, search, filtering, sorting, result summaries and
  pagination where supported. Profile semester defaults apply to new courses;
  existing course semesters are preserved when the profile changes.
- Notes AI summaries/quizzes, saved-result viewing, Ask Your Study Material with
  document retrieval/embeddings, and AI Study Planner with read-only study tools.
- Cloudinary PDF/DOCX/PPTX/JPEG/PNG/WEBP uploads, previews/downloads, replacement
  and cleanup. New study files use authenticated delivery; **existing legacy
  files remain public until migrated**. Profile images retain public delivery.
- Dashboard overview, deadline reminders, in-app notifications and configurable
  notification/theme preferences; Settings, Privacy Policy and Terms pages.
- User/admin roles and an admin statistics dashboard. The backend exposes admin
  statistics, not a full administrative user-management CRUD interface.
- Shared forms/cards, navigation/sidebar, loading/error states, dark mode and
  responsive layouts. See the frontend guide for outstanding browser verification.

## Technology and structure

Frontend: React, Vite, Tailwind CSS, React Router, Fetch API and Lucide React.
Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Multer, Cloudinary,
Nodemailer, CORS and dotenv. AI uses Groq and local transformer embeddings.
Gmail SMTP remains the current email transport; production replacement is deferred.

```text
study-assistant/
  backend/
    config/ controllers/ middleware/ models/ routes/ services/ utils/
    scripts/ tests/ server.js
    uploads/                  # ignored temporary uploads
  frontend/
    public/ src/ tests/
  docs/
    SECURITY.md CLOUDINARY.md AI.md FRONTEND.md
  PROJECT_AUDIT.md
  README.md
```

## Local setup

```bash
git clone https://github.com/AbdullahKashif804/study-assistant.git
cd study-assistant
cd backend
npm install
```

Configure backend environment variables locally or through the host's secret
settings. Names only are listed below; never commit actual values or put backend
secrets in frontend Vite variables.

| Backend variable | Purpose |
| --- | --- |
| MONGODB_URL | MongoDB connection URI; transactions required for account deletion |
| JWT_SECRET | JWT signing secret |
| CLOUDINARY_CLOUD_NAME | Cloudinary product environment |
| CLOUDINARY_API_KEY | Server-side Cloudinary API credential |
| CLOUDINARY_API_SECRET | Server-side Cloudinary signing secret |
| EMAIL_USER / EMAIL_PASS | Existing Gmail SMTP credentials |
| GROQ_API_KEY | Server-side AI API credential |
| PORT | HTTP port; defaults to 5000 |

Backend dotenv configuration loads local `backend/.env`; this file must remain
ignored. The old README's `MONGO_URI` name was incorrect; code uses `MONGODB_URL`.
No environment file is supplied or changed by documentation consolidation.

Start the backend with `npm run dev`, or `npm start` for the normal server command.
MongoDB must connect before HTTP listening begins; initial failure exits nonzero.
Signup creates a pending verification record; successful verification creates the
user; login issues a JWT. Protected APIs verify JWT/user existence and ownership,
and admin statistics additionally require the admin role.

In a second terminal, from the project root:

```bash
cd frontend
npm install
npm run dev
```

Vite normally serves development at `http://localhost:5173`; the backend defaults
to `http://localhost:5000`. Frontend `VITE_API_BASE_URL` is a public build-time
backend origin. Whitespace/trailing slashes are normalized; credentials, paths,
queries, fragments and non-HTTP(S) protocols are rejected. Development alone
falls back to localhost when unset. Production requires an explicit HTTPS origin
and never silently falls back to localhost. Set it before building for Render;
rebuild after changing it. Do not put credentials in this variable.

## Upload and deletion behavior

Frontend validation is followed by authenticated Multer processing, request
validation, Cloudinary upload and MongoDB metadata persistence. Ownership is
checked before backend preview/download delivery. Replacement saves the new
reference before old-file cleanup; scoped temporary cleanup handles success and
failure. External cleanup can fail or become ambiguous; successful database
updates do not guarantee all cloud cleanup completed. Follow the recovery
instructions in the [Cloudinary guide](docs/CLOUDINARY.md) and
[account-deletion guide](docs/SECURITY.md#account-deletion-audit-and-recovery).
Do not run diagnostics or migrations without explicit authorization.

## Checks and evidence

From the repository root:

```bash
node --test backend/tests/*.test.js
node --test frontend/tests/*.test.mjs
```

In `frontend`:

```bash
npm run build
npm run lint
```

The preceding attachment-security implementation recorded 96 backend tests and
19 frontend tests passing, frontend build success and Oxlint with zero errors
and 20 existing warnings. The bundle-size warning remains. These are recorded
results from that task, not tests rerun during documentation consolidation.
Most flow tests mock database/cloud/provider/browser behavior; bcrypt checks use
synthetic passwords. The user separately reported CLOUD-001 live authenticated
raw-PDF compatibility passed, including cleanup. No broader live integration or
browser verification is implied.

The former README claimed 150 successful functional cases and desktop/tablet/mobile
verification. Those are historical claims without supporting artifacts in these
guides; they are not current independently verified results. Use the documented
manual checklists rather than treating them as release acceptance evidence.

## Deployment status and pending work

Production preparation is ongoing. P1 API configuration, MongoDB readiness,
authentication limits, bcrypt cost, validation, replacement safety, temporary
cleanup, AI limits and new-attachment privacy are implemented. This is not a
production security guarantee. Legacy-public migration and deployment/browser
verification remain pending. Production email API replacement (P1 Issue 3) is
deferred; do not assume Gmail SMTP works on Render Free.

Before rollout, configure backend/root directories, environment secrets, frontend
build/dist publishing and SPA deep-link fallback, HTTPS/API origins and production
CORS. Verify MongoDB transaction support, writable temporary storage, model
cold-start/CPU/RAM, proxy trust, shutdown/readiness behavior, delivery quotas,
logging/redaction and recovery with isolated resources. Never use real user data
for destructive tests. The [audit follow-up](PROJECT_AUDIT.md#follow-up-status-2026-10-11)
distinguishes completed fixes, partial mitigations and unresolved recommendations.

Future opportunities include calendar integration, personalized/advanced analytics,
additional notification channels and PWA support. AI summaries/quizzes/planning are
already implemented, not future features.

## Author and use

**Abdullah Kashif** ? BS Artificial Intelligence student and MERN Stack developer.
[GitHub profile](https://github.com/AbdullahKashif804).

Developed for educational and portfolio purposes. No additional license grant is
introduced by this documentation update.
