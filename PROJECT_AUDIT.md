# Study Assistant — Project audit

Audit date: 2026-10-10. Scope: current working tree, including valuable uncommitted work. This is an audit, not approval to implement changes.

Only this report was created. No application source, configuration, dependencies, environment files or database records were changed. Requested builds regenerated ignored `frontend/dist` output; registry commands may update npm's external cache. No backend server was started and no real account, upload or AI request was used for testing.

## 1. Executive summary

The application has a coherent module structure, working production compilation, reusable frontend UI helpers, authenticated CRUD routes and explicit owner filters. Account deletion has meaningful transaction, failure and retry protections. These should be preserved.

**The current tree should not yet be described as production-ready.** Prioritize configurable production API URLs, authentication/OTP/AI abuse controls, server-side validation, safe attachment replacement, and reliable startup. Gmail SMTP replacement is a known pending deployment task, not work performed here.

No Critical issue was confirmed. High findings include missing abuse controls, weak password-hashing cost, unsafe file replacement, and insufficiently bounded AI/document workloads. Some High-impact concerns, especially Cloudinary privacy and deletion concurrency, require deployment or isolated integration verification. These are not claims of demonstrated exploitation.

Build passed; Oxlint passed with **20 existing warnings, zero errors**; **21 mocked tests passed**. Backend syntax checks passed for 52 JavaScript/extensionless service files. Registry audit found no reported frontend vulnerabilities, no reported backend production vulnerabilities, and three High entries in one backend development dependency chain (`nodemon → chokidar → braces`). Vulnerability absence in registry output is not proof of security.

### Evidence and confidence

- **Confirmed:** directly observed source/configuration behavior or reproduced safely without live services.
- **Verify:** plausible risk whose production exposure, timing or impact was not demonstrated.
- **P1:** must address before public production rollout; **P2:** meaningful quality/maintenance work; **P3:** optional polish.
- Change risk refers to implementing the recommendation, not the severity of the existing issue.
- Inventory/reference scans covered 152 non-generated project files and 139 text sources, excluding dependency trees, Git internals, build output and upload contents. Source review focused on route/controller/model/service flows and frontend pages/components/hooks; this is not a penetration test or exhaustive proof of correctness.

## 2. Project structure findings

| ID / priority | Evidence | Finding and why it matters | Recommendation / change risk | Confidence |
|---|---|---|---|---|
| STR-1 / P2 | Root `package.json`, `package-lock.json`; `backend/package.json` | Root installs only Cloudinary, also declared by backend. No root application imports or scripts were found; this is a redundant install context. | Confirm no external workflow uses root installs, then remove only that redundant package context. Medium: check hosting/CI working directory first. | Confirmed duplication; external usage requires verification. |
| STR-2 / P3 | `frontend/src/assets/hero.png`, `frontend/src/assets/vite.svg`, `frontend/public/icons.svg` | No asset-name references found in project text. Public assets can still be accessed directly; absence of references alone is not definitive proof of non-use. | Verify design/external consumers before removal. Low after verification. | Candidates, not deletion-approved. |
| STR-3 / P3 | `frontend/README.md` | Empty documentation file. | Remove or replace with useful frontend instructions after approval. Low. | Confirmed. |
| STR-4 / P2 | `backend/services/studyAgentService` | Used extensionless CommonJS service; not abandoned. The filename can evade extension-based tooling. Node can load it and syntax checks pass. | Optional future rename with all references/tools updated; do not remove. Low to medium. | Confirmed usage; tooling impact needs verification. |

No empty project directories were found in the scan. No `ui-baseline.json`, `ui-report.cjs`, `ui-finish.cjs` or related one-off UI scripts were present in the current inventory; stale IDE tabs are not files. No unused controller/model/route was confirmed: CRUD detail routes may be useful API surface even when the current UI does not call them.

## 3. Unused or unnecessary files and documentation

Retain `frontend/COLOR_REVIEW.md`, `frontend/UI_REVIEW.md`, `backend/ACCOUNT_DELETION.md` and both test files: they document intended semantics, changes, recovery procedures and test limitations. They are not automatically unnecessary merely because the work is complete. The UI report preserves historical sections; consolidate later if helpful, without losing recovery context.

Confirmed unused symbols from Oxlint:

- `frontend/src/pages/Assignments/Assignments.jsx:4–5`: `BookOpen`, `CalendarDays` imports.
- `frontend/src/pages/Home/HomeFeatures.jsx:7–8`: `TrendingUp`, `UserPlus` imports.
- `frontend/src/components/layout/Footer.jsx:2`: `GraduationCap` import.
- `frontend/src/components/dashboard/DashboardRecentActivity.jsx:107`: unused `sortedActivities` calculation. Determine whether intended sorting was accidentally bypassed before deleting it.
- `frontend/src/pages/Dashboard/Dashboard.jsx:21`: unused setter `setDeadlineNotificationsEnabled`; do not remove the notification state itself.
- `frontend/src/pages/Auth/VerifyEmail.jsx:55,94` and `frontend/src/pages/Auth/Signup.jsx:120`: unused catch parameters.

These are **Low severity / P2**, confirmed by lint. Removing imports/catch bindings has low risk; removing the unused sorting computation has medium risk until intended display order is clarified. No broader unused-component deletion is justified by the reference scan.

## 4. Duplicate code and consolidation opportunities

| ID / priority | Evidence | Issue / consequence | Recommendation / change risk | Confidence |
|---|---|---|---|---|
| DUP-1 / P2 | Seven CRUD pages under `frontend/src/pages`; `Settings.jsx`, `Profile.jsx` | Fetch setup, JWT headers, response parsing and error handling are repeated, alongside repeated localhost constants. Fixes can drift between modules. | Small Fetch-based API utility/config first; retain module validation/state and contracts. Medium. | Confirmed. |
| DUP-2 / P2 | `backend/controllers/{assignment,project,course,note}Controller.js`; `backend/utils/cloudinaryUpload.js` | Attachment metadata construction and replace/delete sequencing are repeated. The unsafe sequencing is shared, not a reason to rewrite every controller. | Consolidate a tested upload/compensation helper after fixing failure semantics. Medium/high: external side effects. | Confirmed. |
| DUP-3 / P3 | `backend/services/aiService.js:1–90`, `backend/services/studyAgentService:238–325` | Two Groq clients duplicate endpoint/model/header/error setup, but structured JSON and tool calls have different response needs. | Share transport/timeouts while keeping distinct response validators. Medium. | Confirmed. |
| DUP-4 / P3 | Module `*Stats.jsx`, `*Pagination.jsx` wrappers; `Assignments.jsx`; `components/ui/ModuleLayout.jsx` | Thin re-exports preserve stable module boundaries; Assignments still contains inline layout equivalent to the shared pattern. | Keep wrappers. Optionally adopt ModuleLayout in Assignments when independently tested; do not consolidate solely to reduce file count. Low/medium. | Confirmed, not a defect by itself. |

## 5. Frontend issues and shared helper review

| ID / severity / priority | Evidence | Issue and impact | Recommendation / change risk | Confidence |
|---|---|---|---|---|
| FE-1 / High / P1 | `frontend/src/pages/Auth/Login.jsx:20`; `components/dashboard/GlobalSearch.jsx:5`; all CRUD API constants; `Settings.jsx:62,116`; `Courses.jsx:29` | Requests target `http://localhost:5000`. A deployed browser targets the visitor's machine rather than the hosted API, and HTTPS deployment can introduce mixed-content failures. | One validated API base configuration or same-origin proxy; replace every occurrence without changing endpoint paths. Medium. | Confirmed deployment blocker. |
| FE-2 / Medium / P2 | `components/dashboard/GlobalSearch.jsx:17–58`; CRUD fetching effects | Debounce timers are cleared, but in-flight fetches are not aborted/versioned. Older responses can overwrite newer filter/search results; route unmount does not cancel work. | AbortController or request sequence guards, especially search and list effects; preserve pagination semantics. Medium. | Missing cancellation confirmed; visible race needs browser reproduction. |
| FE-3 / Medium / P2 | `hooks/useFormDraft.js:20–49`; `components/dashboard/GlobalSearch.jsx:78` | Link-click and supported history traversal guards do not cover every programmatic `navigate()` call. Global-search result buttons can navigate away with a dirty form without the anchor guard. Same-path query transitions are ignored. | One router-aware blocker covering programmatic navigation and history; keep Close as draft-preserving. Medium/high: routing migration may be required. | Confirmed coverage gap; browser-history support varies. |
| FE-4 / Medium / P2 | `hooks/useResponsiveDialog.js:29–34`; `components/ui/Modal.jsx`; `components/dashboard/DashboardSidebar.jsx:102` | Each dialog independently snapshots/restores body overflow. Overlapping drawer/form/AI dialogs can restore scrolling while another dialog remains open, or leave stale overflow after an unusual close order. | Central reference-counted scroll lock or verify that overlap cannot occur. Medium. | Verify with simultaneous dialogs and breakpoint changes. |
| FE-5 / Low / P2 | `components/ui/ModuleForm.jsx:27–38`; `src/index.css:113`; `components/dailyTasks/DailyTaskForm.jsx` edit checkbox | Label/control association runs a DOM scan every render; broad form-label CSS forces block display even on flex checkbox labels. | Prefer explicit IDs/htmlFor and scope field-label styling; test checkbox labels and error focus in both modes. Low/medium. | CSS/effect confirmed; visual impact requires browser check. |
| FE-6 / Low / P2 | `components/dashboard/GlobalSearch.jsx` results; list action menus | Search has a label and tab-accessible result buttons, but no combobox/listbox keyboard model. Menus generally lack Escape/focus-return behavior. | Add accessible keyboard interactions without changing actions. Medium. | Confirmed implementation gap; screen-reader testing pending. |
| FE-7 / Low / P2 | `components/dashboard/DashboardHeader.jsx:12`, `DashboardWelcome.jsx`, sidebar user reads | Direct JSON.parse of stored user data can throw for corrupted localStorage. Local UI role/token presence is not authentication proof. | Safe stored-user parser and shared session/error handling. Backend remains authoritative. Low. | Confirmed lack of parse guard in header. |
| FE-8 / Low / P2 | Oxlint findings listed below | Missing effect dependencies risk stale data when captured values change; blindly adding fresh function identities can instead trigger request loops. | Stabilize callbacks or put effect-owned fetches inside effects; review dependencies individually. Medium. | Lint confirmed; no blanket claim that every warning causes a current bug. |

Effect warnings: `Notes.jsx:114`, `Courses.jsx:126`, `Assignments.jsx:127,131`, `Projects.jsx:124,128`, `Quizzes.jsx:119,123`, `TodoTasks.jsx:110`. `context/ThemeContext.jsx:73` has a Fast Refresh export warning, not a production failure. Together with unused-symbol warnings these account for 20 existing warnings.

Shared components are useful and used:

- **Modal / useResponsiveDialog:** native dialog semantics, responsive non-modal desktop forms, focus request, media listener cleanup and scroll restoration. Keep; test overlapping locks, keyboard restoration and mobile viewport behavior.
- **ModuleForm:** shared headings, pending-state fieldset, reset guard, uploads reset and errors. Close hides rather than clears; data loss is not caused by Close itself. Error focusing currently depends on `isFormOpen`, although desktop forms can be visible while false; verify keyboard behavior on desktop submissions.
- **Pagination:** clamps stale pages, normalizes empty results, preserves server pagination; other modules honestly report a single page. Keep.
- **StatCard:** presentation only; keep. Page-local task statistics should remain clearly labeled to avoid implying account-wide totals.
- **useFormDraft:** tests exercise meaningful logic; keep. It does not replace a universal router blocker.
- **ModuleLayout / ModuleColumns / ModuleRecords:** reused by six pages with Assignments as reference. Keep the current structure.

Source inspection shows the intended light/dark/responsive classes; no visual contrast, device layout or browser accessibility pass was performed. Profile object URL cleanup exists (`Profile.jsx:187,209,231`); do not report that preview as an unhandled object-URL leak. Theme and menu listeners generally have cleanup. No `dangerouslySetInnerHTML` usage was found; planner markdown is rendered without a raw-HTML plugin. This is a positive observation, not an XSS guarantee.

## 6. Backend issues

| ID / severity / priority | Evidence | Issue and impact | Recommendation / change risk | Confidence |
|---|---|---|---|---|
| BE-1 / Medium / P1 | `controllers/assignmentController.js:17,180`; `projectController.js:26,186` | Multipart marks are strings; `obtainedMark > totalMark` can compare lexicographically. Safe Node reproduction: `'9' > '100'` is true; `'100' > '20'` is false. Valid marks can be rejected and invalid marks accepted. Models do not enforce the cross-field invariant. | Parse finite numbers before comparisons, enforce positive totals and obtained ≤ total for create/update. Medium: preserve blank/null behavior. | Confirmed language behavior and input path; no database test. |
| BE-2 / Medium / P1 | `controllers/userController.js:329–376`; `models/Users.js` currentSemester; `models/PendingSignup.js` | Profile/signup semester has no 1–8 integer validation, unlike courses. Auth data types, email normalization and password policy are also incomplete. | Explicit server-side schemas/types, bounds and normalization; validate terms as boolean. Medium: account normalization may need a collision-safe migration. | Confirmed. |
| BE-3 / Medium / P2 | `controllers/courseController.js:195–213`; Notes/Assignments/Projects/Quizzes `course` refs | Course deletion removes only the course and its own attachment, leaving references in other modules. Mongoose populate can return null; not every UI assumes that safely. | Decide product policy: block deletion while referenced or explicitly detach/archive. High if cascading deletes are proposed; never infer permission to delete coursework. | Confirmed reference risk; existing orphans not queried. |
| BE-4 / Medium / P2 | `controllers/quizController.js:79–88`; `models/Quizzes.js:23–26`; `services/studyAgentTools.js:getQuizzes`; `deadlinePopupController.js` | UI/list completion is inferred from obtainedMark, while agent and reminders use stored Pending/Submitted/Graded status. Updating quiz marks does not synchronize that status. A graded quiz can be recommended/reminded as pending. | Define one completion interpretation across read paths; avoid schema/API changes until approved. Medium. | Confirmed semantic inconsistency. |
| BE-5 / Low / P2 | `controllers/dashboardController.js` todaysDailyTask query; `deadlinePopupController.js:12–22` | “Today's” tasks use taskDate ≥ now with no upper bound, omitting earlier today and including future days. Reminder day boundaries use server timezone, which can differ from the student's date. | Define date-only/timezone policy and query bounded calendar days. Medium: dashboard calculations must be regression tested. | Confirmed query; intended timezone requires clarification. |
| BE-6 / Medium / P2 | CRUD controller catches; `server.js:22–24`; upload route chains | Validation/cast errors often become 500 responses with raw error.message. Multer/parser errors lack a project JSON error middleware, so frontend response.json can fail on HTML errors. `getoneAssignment` uses 400 for a missing record. | Central sanitized error mapping: 400 validation, 404 missing, 409 duplicate, 413 upload size, 500 unexpected. Medium: preserve response shape. | Confirmed. |

Ownership review: all seven CRUD route families use JWT middleware; record reads/updates/deletes are owner scoped. Notes, assignments, projects and quizzes validate selected course ownership on writes. Admin statistics use authentication followed by role middleware. No confirmed cross-user CRUD deletion or unauthenticated admin route was found. Invalid ObjectIds need cleaner validation, not an unsupported assertion of an ownership bypass.

## 7. Security findings by severity

No confirmed Critical findings. Dependency advisory severity is separated from production exposure below.

| ID / severity / priority | Evidence | Issue / impact | Recommendation / change risk | Confidence |
|---|---|---|---|---|
| SEC-1 / High / P1 | `routes/userRoute.js:9–13`; `routes/aiRoute.js`; `server.js` | No application rate limits, OTP attempt counters or resend cooldowns. Credential/OTP guessing, email spam and paid AI/embedding abuse are not bounded per user/IP. | Auth-specific limits, expiring OTP attempt counters, resend cooldown and AI quotas/concurrency caps; consider reverse-proxy trust settings. Medium. | Confirmed absent in app; external gateway controls not inspected. |
| SEC-2 / High / P1 | `controllers/userController.js:62,523–526` | bcrypt work factor is 6 and backend accepts passwords without a robust length/strength policy. Offline cracking resistance is weak relative to current guidance. | Benchmark ≥10 bcrypt cost, set a consistent policy including bcrypt's input-byte limit, and rehash on successful login when needed. Medium: CPU/login latency and old hashes. | Confirmed. See OWASP source below. |
| SEC-3 / Medium / P1 | `controllers/userController.js:51,118,187,245`; CRUD query filters and `$regex` | Expected strings are not consistently type checked. Auth email can arrive as an object and be passed into a Mongo query; search text is used as a regex rather than escaped literal text. | Reject non-scalar input, allowlist fields/enums, escape bounded literal search, limit query duration. Medium. | Confirmed unsafe input acceptance; no demonstrated authentication bypass. |
| SEC-4 / Medium / P2 | `server.js:22–23` | `cors()` permits all origins; no application security-header/CSP setup. CORS alone does not grant an attacker a bearer token, but this is not an intentional production policy. | Restrict configured origins, apply appropriate headers and frontend-host CSP; verify HTTPS/proxy setup. Medium: CSP/CORS can break legitimate clients. | Confirmed app config; hosting headers unknown. |
| SEC-5 / Medium / P1 | `middleware/uploadMiddleware.js:30–58`; `profileUploadMiddleware.js`; `utils/cloudinaryUpload.js` | Limits exist (10MB attachments, 5MB profile), but MIME is client supplied and Cloudinary type is chosen by filename extension. No magic-byte/document validation or processing budget. | Verify actual bytes/extension consistency, reject unsupported content, bound parser work; consider malware policy for shared downloads. Medium/high. | Confirmed checks; malicious-file exploit not tested. |
| SEC-6 / High / P1 | `utils/cloudinaryUpload.js` uploader options; stored secure_url fields | Uploads do not request authenticated/private delivery. A private study application may expose files to anyone holding a delivery URL. URL obscurity is not user authorization. | Verify deployed delivery settings using disposable assets; choose authenticated/signed access if privacy is required. High: changes file viewing and RAG download flows. | Public-default code configuration confirmed; actual URL accessibility requires verification. |
| SEC-7 / Medium / P2 | `Auth/Login.jsx:33`; `authMiddleware.js:14`; `userController.js:268–275,475–543` | Seven-day bearer JWTs live in localStorage; password change does not revoke earlier JWTs. An acquired token remains valid after password rotation while the user exists. | Token version/credential timestamp invalidation and session policy; assess cookie/CSRF tradeoffs separately. High if storage/auth contract changes. | Confirmed token policy; no token theft demonstrated. |
| SEC-8 / Medium / P2 | `PendingSignup.js`; `userController.js:118–225` | OTP uses secure crypto randomness and ten-minute expiry, but is stored in plaintext; expired pending rows have no TTL cleanup. Initial signup uses insert, so re-signup while pending can hit duplicate-key 500. | Hash OTP, bound attempts, expire stale rows and define safe resend/restart behavior. Medium: TTL/index policy and retries. | Confirmed. |
| SEC-9 / Low / P2 | `userController.js:245–266`; controller error responses | Distinct “User not found” and password mismatch responses enable account enumeration; raw service errors may disclose infrastructure details. | Generic auth response and sanitized public errors with server request IDs. Low/medium. | Confirmed. |

Password guidance: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) recommends at least cost 10 for legacy bcrypt and addressing its 72-byte limit. Do not silently truncate passwords or invalidate existing hashes.

### File cleanup and account deletion

| ID / severity / priority | Evidence | Issue / impact | Recommendation / change risk | Confidence |
|---|---|---|---|---|
| FILE-1 / High / P1 | `userController.js:378–409`; `assignmentController.js:216–242`; equivalent note/project/course update paths | Old Cloudinary resource is deleted before upload and DB save succeed. Failure can leave a DB reference to a deleted file. Newly uploaded files can become orphaned if save fails. | Upload first, validate/save new metadata, then queue old-file cleanup; compensate new uploads on failure. High: external side effects and retries. | Confirmed sequencing; not fault-injected live. |
| FILE-2 / Medium / P1 | Upload middleware runs before controller validation; `cloudinaryUpload.js` cleanup only runs when upload is called | Files reaching an early controller validation/not-found return never reach uploader cleanup and remain in local uploads. Repeated invalid uploads can consume disk. | Request-scoped finally/response cleanup for unconsumed temp files; test all early exits. Medium. | Confirmed code path; no real upload executed. |
| FILE-3 / Medium / P2 | `cloudinaryDelete.js`; ordinary record/image delete handlers | Ordinary CRUD does not check Cloudinary's returned result before deleting/nulling the DB reference, unlike account deletion. No durable retry record exists. | Validate responses and preserve cleanup identifiers until confirmed/queued. Medium. | Confirmed difference. |
| DEL-1 / High / P1 for multi-worker rollout | `accountDeletionService.js:50–83`; `authMiddleware.js:22–30`; `ACCOUNT_DELETION.md` | Pending flag blocks newly authenticated requests, not writes already past auth or background indexing. Final snapshot can miss late writes and leave user-owned records/resources after account deletion. | Coordinate/quiesce writes or make all writers participate in a durable deletion protocol; isolated concurrency tests first. High: cross-cutting write lifecycle. | Known documented limitation; race not reproduced. |
| DEL-2 / Medium / P2 | `accountDeletionService.js:59–66`; `ACCOUNT_DELETION.md` retry instructions | Cloudinary is non-atomic with MongoDB. Partial file removal is irreversible; pending account needs manual retry; malformed legacy refs need trusted repair. No automatic recovery worker. | Preserve existing references/flag behavior; add operational retry/alert workflow before scale. Medium. | Confirmed design, not falsely reported as all-or-nothing external rollback. |

Positive deletion findings: explicit server confirmation `DELETE`, identity from verified JWT only, seven owner collections plus matching PendingSignup covered, embedded note AI/RAG removed with Notes, resource types/deduplication checked, “not found” accepted idempotently, MongoDB deletions transactional, failed cleanup returns an error, deleted/pending users rejected from normal protected APIs. Transactions require a suitable replica set/sharded deployment; Atlas configuration was not contacted.

## 8. AI feature findings

| ID / severity / priority | Evidence | Issue / impact | Recommendation / change risk | Confidence |
|---|---|---|---|---|
| AI-1 / High / P1 | `aiService.js:20–43`; `studyAgentService:238–325`; `documentTextService.js:26–37` | External fetches lack explicit timeout/abort budgets. Agent has six iterations but no output-token limit or total tool-call/context budget per iteration. Paid requests and long-running work can accumulate. | Transport deadlines, provider token limits, total request/concurrency budgets and safe failure responses. Medium. | Confirmed configuration gaps. |
| AI-2 / High / P1 | `ragService.js:212–260`; `documentTextService.js:35,66`; `embeddingService.js:36–63` | Ask requests index every unindexed note/document synchronously, download full files, batch all chunks, then load all chunks again. Decompressed text/chunk count has no cap; upload-size limits do not bound extracted text. | Extraction byte/text/chunk budgets, indexed status, bounded batches, background indexing when justified. High if queue/index architecture changes. | Confirmed algorithm; resource impact needs load test. |
| AI-3 / Medium / P2 | `ragService.js:150–177,340`; `aiService.js:answerFromNotes`; `aiController.js:askNotes` | Score ≥0 admits weakly related chunks; grounded is model-reported, not independently validated. Empty supported documents are re-downloaded because cache requires nonempty chunks. | Calibrate relevance thresholds with fixtures, cache empty/unsupported outcomes and clarify confidence/source wording. Medium: avoid suppressing valid retrieval. | Confirmed logic; hallucination frequency not measured. |
| AI-4 / Medium / P2 | `aiService.js` JSON parse; `aiController.js` saved result; `studyAgentService:safeParseArguments`; `studyAgentTools.js` | Provider JSON schemas are good constraints but parsed responses/tool arguments lack independent complete runtime validation. Document/note text can contain prompt injection. | Validate schema/bounds locally; explicitly treat retrieved text as untrusted data, retain read-only allowlisted tools and owner scope. Medium. | Confirmed validation gap; prompt attack not tested. |
| AI-5 / Medium / P2 | `embeddingService.js:1–17`; `ragService.js:ensureNoteTextIndexed`; note update invalidation | Failed model initialization leaves a rejected cached promise until restart. Concurrent indexing/editing has no content-version guard; stale text chunks can be saved after edit. | Reset failed initialization safely, deduplicate indexing and compare content version/hash before committing chunks. Medium. | Promise behavior confirmed; cache race requires integration test. |
| AI-6 / Medium / P2 | `studyAgentTools.js:getAssignments/getProjects/getQuizzes`; `studyAgentService:MAX_AGENT_STEPS` | Tool result count is capped at 30, but description lengths are not; model-selected status is passed through without strict allowlist validation. Context grows over steps. | Validate tool arguments and bound serialized results/context. Medium. | Confirmed. |
| AI-7 / Medium / P2 | `documentTextService.js:27`; `cloudinaryUpload.js` | Downloader trusts the stored URL and follows fetch behavior without a host policy. Current API obtains URLs from Cloudinary, so an arbitrary-user SSRF path was not found. | Defense-in-depth URL/redirect allowlist if legacy/imported URLs are possible. Medium. | Trust-boundary concern requiring verification; not confirmed exploitable SSRF. |

Positive AI findings: keys are server-side environment references, note AI lookup and retrieval are owner scoped, note input is truncated to 12,000 characters, Ask input is limited to 1,000 and planner to 1,500, summary/quiz use structured response schemas, no-result RAG avoids a Groq call, note edits invalidate AI/text chunks, attachment changes invalidate document chunks, and saved Summary/Quiz UI avoids regeneration. Agent tools are read-only and do not accept a frontend user identity.

## 9. Dependency findings

All three lockfiles use lockfileVersion 3 and their root dependency declarations match the corresponding manifests. This does not prove a clean-install/deployment reproduction; no packages were installed or lockfiles regenerated.

Registry checks on the audit date:

| Check | Result | Interpretation |
|---|---|---|
| Frontend `npm audit --json --ignore-scripts` | 0 reported vulnerabilities | Registry coverage only. |
| Backend same command | 3 High package entries | One chain: nodemon → chokidar → braces. |
| Backend `npm audit --omit=dev --json --ignore-scripts` | 0 reported vulnerabilities | Reported chain is development-only with current dependency declarations. |

**DEP-1 — High advisory / P2; confirmed dependency finding, runtime exploitability not shown.** `backend/package-lock.json` packages `nodemon`, `chokidar`, `braces`: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) reports stack-exhaustion with deeply nested patterns in braces ≤3.0.3, with no patched version listed at review time. npm proposes an old major nodemon downgrade; **do not run audit fix --force or accept that suggestion automatically**. Evaluate a supported watcher alternative/update or constrain local watch inputs; deploy with dev dependencies omitted. Change risk: medium, development workflow/Node compatibility. Three entries are not three independent vulnerabilities.

`npm outdated --json` succeeded after read-only registry access was allowed (exit 1 means updates were found):

| Package | Installed | Latest reported |
|---|---|---|
| backend dotenv | 17.4.2 | 18.0.7 |
| backend express | 5.2.1 | 5.3.0 |
| backend mongoose | 9.7.3 | 9.11.1 |
| backend nodemailer | 10.0.11 | 10.1.0 |
| frontend @types/react | 19.2.17 | 19.3.0 |
| frontend @types/react-dom | 19.2.3 | 19.3.0 |
| frontend @vitejs/plugin-react | 6.0.3 | 6.1.2 |
| frontend lucide-react | 1.26.0 | 1.55.0 |
| frontend oxlint | 1.71.0 | 1.87.0 |
| frontend react / react-dom | 19.2.7 / 19.2.7 | 19.3.0 / 19.3.0 |
| frontend vite | 8.1.0 | 8.3.4 |

**DEP-2 — Low / P3; confirmed available updates.** Review release notes and test deliberately; no upgrade is required merely because a newer release exists. dotenv is a major change; Express/Mongoose can alter validation/query behavior; keep React/ReactDOM aligned and check Vite/plugin/Node compatibility. Change risk: medium. Versions not listed were not reported outdated by that command, not guaranteed vulnerability-free.

**DEP-3 — Low / P3; confirmed build usage.** `frontend/package.json` places Tailwind and its Vite plugin under dependencies although they are build-time tools. Reclassification is optional and can break hosts that omit dev dependencies before building. Change risk: medium. Backend runtime dependencies all have identified uses, including lazy-loaded transformers and officeparser; do not remove them as “unused.” Root Cloudinary redundancy is STR-1.

## 10. Performance findings

| ID / priority | Evidence and impact | Recommendation / change risk | Confidence |
|---|---|---|---|
| PERF-1 / P2 | `frontend/src/App.jsx` statically imports every page; `Dashboard.jsx` statically brings planner/markdown into the application graph. Build emits one 685.66kB JS chunk (169.35kB gzip), CSS 87.38kB (13.62kB gzip), and a 93.05kB auth image. | Route lazy loading with Suspense/error boundaries, then optionally lazy-load planner markdown. Do not merely raise the warning threshold. Medium: route/loading regression. | Single entry chunk confirmed; no module-size attribution profiler run, so exact package contribution is unmeasured. |
| PERF-2 / P2 | Owned schemas under `backend/models` declare no explicit owner/sort compound indexes. Lists, search, dashboard counts and deletion use owner filters. | Use isolated explain plans/production metrics to choose `{user, createdAt}`, `{user, dueDate}` or taskDate/status combinations; migrate deliberately. Medium: storage/write overhead and index build. | Schema absence confirmed; actual Atlas indexes unknown. |
| PERF-3 / P2 | Course/assignment/project/quiz get handlers return full unbounded lists; global search queries seven collections without a result limit. Some populate full Course including attachment data. | Field projections, lean reads where safe, bounded search results; introduce server pagination only with coordinated frontend/API changes. Medium/high for pagination contract change. | Confirmed. |
| PERF-4 / P2 | `ragService.js:212–340` scans and sorts all user chunks for every question, with two full note loads; embeddings are stored inline in Notes. | Bound request work first; then measure Atlas vector search/separate index only if volume warrants it. High for storage/index architecture changes. | Confirmed algorithm; production scale unmeasured. |
| PERF-5 / P3 | `DailyTaskList.jsx` attaches one document listener per mounted item; ThemeProvider creates a new context value each render; CRUD list fetches run on many keystrokes. | Profile before memoization; consolidate menu listeners, debounce where useful, address request races first. Low/medium. | Implementation confirmed; user-visible cost unmeasured. |

Dashboard already parallelizes independent DB operations; do not serialize them in cleanup. Daily/To-Do/Notes page limits cap at 50, but page/limit parsing does not explicitly require finite integers; validate invalid/date/sort parameters consistently. Avoid assuming `$regex` queries become efficient simply by adding ordinary indexes.

## 11. Testing and quality

Executed non-destructively:

| Command | Result / limitations |
|---|---|
| `npm.cmd run build` in frontend | Passed; existing >500kB chunk warning. |
| `npm.cmd run lint` in frontend | Oxlint, not ESLint; passed, 20 existing warnings, zero errors. |
| `node --test frontend/tests/ui-behavior.test.mjs backend/tests/accountDeletion.test.js` | 21 passed: 10 frontend and 11 backend mocked tests. |
| `node --check` across backend JS and extensionless service | 52 files passed syntax checks; no server import/start or DB connection. |
| npm audit/outdated | Results above; initial sandbox registry/cache access failed, read-only retries succeeded. No install/upgrade/fix commands used. |

**TEST-1 — Medium / P1 for release confidence; confirmed coverage gap.** Existing tests load actual source in VM harnesses, but replace React/browser hooks, models, JWT and Cloudinary. They are useful unit-level checks, not actual React rendering, browser dialog semantics, Mongoose transactions or real JWT cryptography. Keep them. Add isolated integration/browser suites after approval. Risk: medium; test fixtures must never target existing accounts.

Missing coverage includes signup/signin/OTP expiration and guessing limits; scalar/NoSQL input rejection; password policy/session revocation; every CRUD owner boundary and invalid foreign course; marks comparisons and schema validation; actual semester promotion without rewriting old courses; filter races, reset/page edge cases; Multer early-return temp cleanup and replacement compensation; Groq response validation/timeouts/quotas; parser limits/RAG no-result and stale indexing; deletion concurrency and real replica-set rollback; real keyboard focus/Escape/scroll locking and browser-history navigation; both themes and device widths.

**TEST-2 — Low / P2; confirmed tooling gap.** Neither app has a test script; backend has no lint script; no CI workflow was present in the inventory. Add explicit repeatable test/check commands and CI, using isolated fixtures. Low change risk. Do not add tests that merely assert class strings when rendered behavior is the risk.

## 12. Deployment readiness

| ID / priority | Evidence / issue | Recommendation / change risk | Confidence |
|---|---|---|---|
| DEPLOY-1 / P1 | `server.js:24,43`; `config/db.js` catches and logs errors without rethrowing. HTTP starts before DB is ready; `/` always says Running even when DB connection fails. | Await DB before listen, fail startup clearly, distinguish liveness/readiness. Medium. | Confirmed. |
| DEPLOY-2 / P1 | `utils/sendEmail.js:1–8` uses Gmail SMTP. | Known pending task: replace with an email API in separately approved work, test verified sender/delivery/retry. Medium. | Confirmed pending; no email sent or implementation changed. |
| DEPLOY-3 / P2 | `server.js`; all package manifests | No explicit required-env validation, Node engine declaration, graceful SIGTERM shutdown or readiness endpoint. Backend main says index.js while start correctly uses server.js. | Pin supported Node, validate required configuration without logging values, close server/DB on shutdown and document scripts. Medium. | Confirmed app-level gaps; platform settings unknown. |
| DEPLOY-4 / P1 verification | `embeddingService.js:3–12`; `accountDeletionService.js:50–83`; local disk uploads | Cold model download/cache, CPU/RAM, writable ephemeral upload directory and MongoDB transaction support need deployment validation. | Test a disposable Render deployment with isolated Atlas/Cloudinary resources; size runtime, cache model intentionally, monitor failures. Medium/high operational risk. | Requirements observed; actual host capacity not measured. |
| DEPLOY-5 / P1 verification | `frontend/src/main.jsx` BrowserRouter; `vite.config.js`; no deploy manifest | Deep links need static-host SPA fallback; API/CORS/HTTPS and service root directories are not documented as verified production settings. | Render static site: frontend build and dist publish with rewrite to index.html; backend service: backend root and npm start, configured PORT. Verify actual setup before rollout. Low/medium. | Configuration requirement; Render dashboard not accessed. |

Render's [free service documentation](https://render.com/docs/free) states that free web services block outbound SMTP ports 25, 465 and 587. Gmail SMTP replacement is therefore a deployment blocker for that tier; paid-tier delivery and sender configuration would still require testing. This audit does not choose or integrate an email provider.

Referenced backend environment names (values were not printed): `MONGODB_URL`, `JWT_SECRET`, `PORT`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `GROQ_API_KEY`. No frontend environment-based API base is currently used. Never place backend secrets in Vite-exposed variables. Future example files should contain placeholders only.

Production logging needs sanitized structured errors/request IDs and alerting for DB connection, OTP delivery, Groq failures, extraction budgets and pending deletion. Existing console errors are useful but can include operational detail; avoid logging tokens, passwords, OTPs or whole external payloads. A real log-export/redaction review was not performed.

## 13. Git and repository hygiene

- `.gitignore:1–5` excludes node_modules, `.env`, `.env.*`, dist and backend/uploads. Ignore checks confirmed frontend/dist, backend/uploads and both app `.env` paths are ignored. The `.env.*` rule would also ignore future `.env.example`; add a narrow exception only if sanitized examples are approved.
- No tracked sensitive/generated filename candidates were found for env/private keys/node_modules/dist/uploads. Reachable Git commit trees also contained no `.env`/private-key filename candidates. **This is not a full secret-history scan.** Current non-env project text was checked for a small set of token/URI/private-key signatures with no matches; arbitrary passwords/API formats, binary files, inaccessible refs and historical file contents are not comprehensively covered. Do not claim the repository is proven secret-free. Run a dedicated secret scanner before push; never print detected values.
- Staged-file count was zero. Many tracked modifications and untracked AI services, shared UI helpers, tests and reports are valuable completed work. Review/add those deliberately; blanket cleanup would lose functionality. No reset/restore/clean/force command was used.
- Generated build output remains ignored. No temporary UI scripts were found. Optional ignore additions: log files, coverage, browser-test output and machine/editor artifacts if those are actually generated; no need to invent exclusions for absent artifacts.
- `README.md` describes admin user management, but backend admin routes expose statistics only. **DOC-1 — Low / P2, confirmed mismatch:** align documentation with implemented features and update AI/deployment/test/recovery instructions. Low change risk. Retain useful audit reports or link them from a concise docs index; deleting documentation is not a production optimization.

## 14. Recommended cleanup actions and approval plan

### Priority 1 — Must fix or verify before public production

1. FE-1 / DEPLOY-1–5: configure production API base, await DB, validate deployment readiness, verify SPA rewrites/transaction support/model capacity, and separately complete the known email API task.
2. SEC-1–3 / BE-1–2: enforce scalar input/number/semester/password validation, stronger hash cost, OTP/login/resend limits and AI quotas. Preserve existing account and semester data; design any normalization/index migration explicitly.
3. FILE-1–2: fix replacement compensation and local temp-file cleanup. Add isolated failure-path tests before changing live upload behavior.
4. AI-1–2: explicit external timeouts and parser/embedding/token/concurrency budgets.
5. SEC-6 / DEL-1: verify file delivery privacy and coordinate account deletion with in-flight writers before multi-worker production. Do not weaken current transaction/retry checks.
6. TEST-1 / Git hygiene: isolated integration and browser release checks, plus a dedicated secret scan before committing/pushing. No real data deletion for tests.

### Priority 2 — Should fix

1. Remove only confirmed unused imports/bindings; decide intended recent-activity ordering before removing its dead calculation.
2. FE-2–8: cancel stale requests, close draft-navigation gaps, verify multi-dialog scroll locks and keyboard/label behavior; resolve effect warnings safely.
3. BE-3–6 / SEC-7–9: define referenced-course deletion, unify quiz completion/date behavior, sanitize errors, improve OTP lifecycle and session invalidation.
4. PERF-1–4: route code splitting, bounded search/projections, measured index design and RAG request-work reduction.
5. DEP-1: evaluate the development watcher advisory deliberately; omit dev dependencies at backend runtime, never force an old downgrade.
6. Add repeatable tests/checks/CI and operational retry/logging documentation; consolidate repeated Fetch/upload transport only with regression coverage.

### Priority 3 — Optional

1. Verify the three unreferenced assets before removal; remove/fill the empty frontend README.
2. Confirm root-package external usage before deleting the redundant Cloudinary install context.
3. Consider extensionless service naming, build-dependency classification and report organization.
4. Review package updates individually, profile before React memoization, and avoid new theme/CRUD abstractions solely to reduce file count.

### Safe implementation sequence after approval

Preserve the current working tree with a reviewable task-specific snapshot; make small independent patches. Start with deployment configuration and deterministic validation tests, then auth/AI limits, then upload failure recovery. Review schema/API impacts separately. Use disposable fixtures for integration and browser tests. Re-run build, lint, unit/integration checks and registry audit, then review the staged diff and secret scan before any commit. Commit/push only on a separate explicit instruction.

**Audit complete. No cleanup or optimization has been implemented. Awaiting approval.**
