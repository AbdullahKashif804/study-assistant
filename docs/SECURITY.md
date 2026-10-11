# Security and backend safeguards

[Project overview](../README.md) | [Historical audit](../PROJECT_AUDIT.md) | [Cloudinary operations](CLOUDINARY.md) | [AI limits](AI.md)

This guide describes implemented safeguards and unresolved limitations as of
2026-10-11. Historical observations below explain the fixes; they are not claims
that the old behavior remains. Implementation does not establish production readiness.

## Startup and password hashing

- HTTP listening awaits MongoDB connection. Initial failure prevents listening,
  emits a sanitized startup failure and exits nonzero. Server selection times out
  after 10 seconds. See `backend/server.js` and `backend/config/db.js`.
- `backend/config/password.js` centralizes bcrypt cost 12 for signup and explicit
  password changes. Existing cost-6 hashes still verify; no forced reset, mass
  rehash or automatic login rehash is performed. A prior local benchmark was
  approximately 524 ms at cost 12; this is not a Render performance guarantee.
  Benchmark CPU and concurrent authentication on disposable deployment resources.
- Stronger hashing does not implement a password length/strength policy, bcrypt
  input-byte handling, or revocation of existing JWTs after password changes.

## Authentication request limits

Only the four public POST authentication endpoints are limited. Authenticated CRUD,
profile, password-change, and deletion routes retain their existing middleware.
The limiter preserves JWT logic, OTP generation/expiry, and the existing email transport.

| Endpoint under `/api/user` | Per client IP | Per normalized email |
| --- | --- | --- |
| `/signin` | 20 / 15 minutes | 10 / 15 minutes |
| `/signup` | 10 / hour | Shared signup/resend budget: 5 / hour and 1 / minute |
| `/verify-email` | 30 / 10 minutes | 5 / 10 minutes |
| `/resend-verification` | 10 / hour | Shared signup/resend budget: 5 / hour and 1 / minute |

These are fixed windows starting with the first counted request. Checks run in
order (IP, email hourly budget, cooldown). An attempt consumes each budget it
reaches, including successful requests, invalid submissions, controller failures,
and requests subsequently rejected by a later check. Rapid blocked resends can
therefore exhaust the hourly budget before five emails are actually sent. OTP
resends do not reset the independent verification-attempt budget.

429 responses use a generic message and `Retry-After` seconds with `Cache-Control:
no-store`. The limiter performs no user lookup, logs no identities or codes, and
hashes trimmed, lowercase email keys without changing controller input or stored
email data. Invalid/missing email types still consume the IP budget. IPv4-mapped
IPv6 addresses share IPv4 keys; native IPv6 clients share a /56 subnet budget.

### Proxy assumptions

`server.js` trusts exactly one nearest proxy hop only when Render's platform
variable `RENDER` equals `true`. Other environments ignore forwarded headers.
The limiter uses Express's `req.ip`, never the leftmost raw forwarded header.
Forged entries before the nearest-hop client address do not change its key.

Before production rollout, verify Render's actual forwarded chain with two
independent clients. This assumes the nearest ingress supplies a trustworthy
rightmost forwarded address and all public access traverses it. If that address
is another shared proxy, clients can share a budget. Do not blindly increase hop
count or set `trust proxy` to `true`: review ingress/header sanitization and direct
or private access paths first. Additional CDNs/proxies require reassessment.
See [Express proxy guidance](https://expressjs.com/en/guide/behind-proxies/) and
[Render's application-level rate limiting guidance](https://render.com/articles/how-render-handles-ddos-attacks).

### Limitations and recovery

- State is process-local, resets on restart/deploy, and is not shared across
  instances/workers. These limits are appropriate for a single backend process;
  multiple instances multiply the available budget. Distributed enforcement is
  future work, not implemented here.
- Expired buckets are swept on requests, at most once per minute. At 10,000 active
  buckets, new identities receive generic 429 responses until capacity returns;
  active limits are never evicted to allow bypass. No background timers are used.
- Shared networks and IPv6 subnets share IP budgets. Attackers can temporarily
  exhaust an email budget, delaying its legitimate owner; the restriction expires
  automatically. No permanent account lockout is created.
- Fixed windows permit bursts around boundaries. Distributed bot traffic and durable per-OTP attempt counters remain separate work.
  AI concurrency/workload limits are implemented separately; see [AI limits](AI.md).
- Existing controller messages reveal user/pending-signup existence. New limiter
  responses do not add that disclosure. Scalar request validation now rejects object-valued authentication inputs.
  Password policy, OTP storage, email normalization and production email transport
  still have unresolved audit recommendations; stronger bcrypt cost alone does not resolve them.

Run `node --test backend/tests/*.test.js` from the project root. Tests use isolated
clocks and mocked database/email operations; proxy tests exercise Express request
IP resolution without opening a socket. No real OTP/email requests are made.
Manual browser checks: normal signup/verify/login/resend, displayed 429 messages,
recovery after Retry-After, and unaffected authenticated CRUD. Email transport
replacement remains deferred.

## Backend input validation (P1 Issue 6)

Historical inspection, before P1 Issue 6, confirmed marks could be compared lexicographically when multipart
fields are strings; total marks lacked positive/finite checks. Course semester
checks coerced booleans/arrays, while signup/profile semesters had no bounds.
Project technologies accepted arbitrary parsed JSON. Object-valued authentication
email could reach MongoDB queries. Text, dates, enums, and relationship identifiers
also needed request-level type checks.

All seven CRUD write routes now use the same validation middleware for create and
update. It runs after existing JWT middleware and, where present, multipart
parsing, before controllers or Cloudinary operations. Record-ID checks run after
authentication. Existing course ownership queries and record ownership filters
remain intact. Public authentication validation follows rate limiting so invalid
attempts still consume the existing request budget.

### Rules and frontend compatibility

- Numbers: accept numeric JSON values and decimal/exponent numeric strings; reject
  booleans, arrays, objects, malformed/hex strings, NaN/infinity, and magnitudes
  beyond Number.MAX_SAFE_INTEGER. Finite decimals remain supported for marks.
- Assignment/project/quiz total marks must be > 0; obtained marks must be >= 0 and
  <= total. Numeric strings are converted before existing controller comparisons.
  Blank/null obtained marks become null; omission remains omission. Assignments
  and projects retain their existing omitted-score clearing behavior; quizzes
  retain existing scores on omission and reject a lower total than that score.
- Signup/profile/course semesters must be integers 1–8. Partial profile updates
  may omit the semester. Only submitted values change; no course semesters are
  rewritten when a profile semester changes.
- Required text must be nonblank strings. Optional text, submitted enum values,
  six-digit OTP text, and profile bio's existing 500-character maximum are checked.
  Terms acceptance must be boolean true. No email normalization or password-policy
  migration is introduced.
- Required dates accept valid ISO date/date-time strings and reject invalid
  calendar dates. Blank optional profile birth dates normalize to null.
- Course/record identifiers must be 24-character hexadecimal ObjectId strings.
  Notes may omit or clear their optional course relationship.
- Technologies must be a nonempty string array, supplied as the existing JSON
  multipart string or an actual array. The controller still receives serialized
  JSON for its existing parse step.

The frontend currently sends assignment/project/course/profile/note data using
FormData; numeric fields become strings. Quiz/task/auth requests use JSON, with
signup semester still a string. These valid formats require no frontend changes.

### Mongoose and scope

Inspection found creates use save(); assignment/project/course/note/profile
updates also use save(). Quiz/daily-task/to-do updates already set runValidators:
true. These validation mechanisms are preserved. P1 Issue 6 left schemas and indexes
unchanged to avoid unexpectedly rejecting legacy data on unrelated document saves.
The new request checks protect the mounted routes; direct/internal model writes
still rely on existing schemas and must enforce equivalent invariants separately.

Previously accepted invalid values now return HTTP 400. Existing stored data is
not migrated, removed, or scanned. Editing a record containing invalid legacy
values requires correcting the submitted values. Numeric values beyond the safe
range and unsupported date formats now reject instead of coercing silently.

Search-regex escaping, list-query/pagination validation, broad Mongoose error
mapping, and cross-request update concurrency are not changed in this patch.
Existing controller catches may still return 500 for other schema/cast failures.
Multipart early-return cleanup is now covered by the P1 Issue 8 request-scoped
cleanup wrapper; see [temporary upload cleanup](CLOUDINARY.md#temporary-uploads-p1-issue-8). No real uploads were performed.

### Verification

Run `node --test backend/tests/*.test.js`. New tests cover numeric bounds/types,
semesters, optional marks, enums/dates/technologies/auth scalar checks, shared route
wiring, all seven create/update controller paths, and course ownership failures.
Persistence and external services are mocked; no live MongoDB, SMTP, Cloudinary,
or browser execution is implied.

Manual browser checks: create/edit all seven modules; marks 9/100, zero, blank,
and decimals; profile promotion and course override; optional birth date/course;
technology list and attachments; signup/OTP/login/password change; and preserving
drafts when a server validation error is shown. Use disposable test data and the
existing authorized flows, not production records.

## Account deletion audit and recovery

Historical inspection, before the account-deletion correction: the cascade covered Notes, Assignments, Projects, Courses, Quizzes,
DailyTasks, ToDoTasks, and the User. It attempted attachment/profile cleanup but
did not check Cloudinary result statuses, and database deletes were sequential.
A partial failure could leave only some collections deleted. PendingSignup
records matching the account email were not cleaned up. Note AI summaries,
quizzes, and embedding chunks are embedded in Notes and disappear with them;
no separate user-owned AI collection was found. Quizzes currently have no
attachment field; the cleanup scan tolerates legacy attachment references.

### Flow and retry

The Settings form still requires typing `DELETE`. The API now validates this
confirmation and uses only `req.user._id` from verified JWT middleware.

1. A MongoDB transaction marks the account `accountDeletionPending`.
2. Middleware rejects new protected requests for that account, except the
   confirmed deletion endpoint. Sign-in remains available so an expired JWT
   does not prevent recovery through Settings.
3. Read all stored upload identifiers and delete Cloudinary resources using
   their stored resource and delivery types. Missing delivery type means legacy public
   (`upload`); profile images retain their public policy. Resource identity includes
   delivery type, preventing confusion between public and authenticated assets. Only `ok` and `not found` count as success.
   Missing identifiers or attachment resource types fail safely rather than
   silently orphaning files under an incorrectly guessed resource type.
4. A second transaction checks for changed upload references and deletes all
   seven owned collections, matching PendingSignup records using the stored
   account email, and the User together.

Cloudinary is outside the MongoDB transaction. If cleanup or the final database
transaction fails, the account remains pending, all database references remain,
and the API returns an error. Files already removed cannot be restored. Retry
through Settings, typing `DELETE` again; absent files are accepted on retries.
There is no automatic retry worker. Server logs identify cleanup failures.
For a malformed legacy attachment, an operator must repair the stored identifier
from trusted upload records before retrying; never guess a public ID or blindly
clear the pending flag. A lost success response can be checked by signing in:
the user record will be absent if the transaction committed.

### Deployment requirements and limits

MongoDB must support transactions (replica set or sharded deployment). On a
standalone server the initial transaction fails before any external resource is
deleted; no unsafe sequential fallback is used. Configure a transaction-capable
deployment before retrying. No database connection or real deletion was performed
during the original audit. This documentation consolidation also performs no live operations.

The pending flag blocks requests authenticated after deletion starts. Requests
already past authentication, background indexing, and writes outside this API
can still be in flight. Changed upload references visible to the final transaction
are detected, but this is not a distributed barrier against late writes after
its snapshot. Quiesce the account's in-flight jobs/writes before deletion in a
multi-worker deployment. A strict guarantee against arbitrary concurrent writes
would require all write paths to participate in a shared deletion protocol;
normal CRUD handlers were intentionally not rewritten in this task.

Resources whose database references were already lost before this change cannot
be discovered by this cascade. Cloudinary delivery/CDN caches may outlive origin
deletion. No global Cloudinary sweep is performed because it could affect other
users.

### Verification

Run `node --test backend/tests/accountDeletion.test.js` from the repository root.
Tests use mocked models, transactions, JWT verification, and Cloudinary, with no
database or network connection. They cover owner scoping, complete cascade,
resource types, explicit confirmation, failure rollback, retry, changed uploads,
malformed references, unsupported transactions, and deleted/pending JWT access.

Manual integration checks still needed: disposable accounts on an isolated replica
set, real Cloudinary cleanup and retry, forced transaction failures, confirmation
and session clearing in the browser, and concurrent writes with production workers.

## Unresolved deployment and security work

Production email API replacement remains deferred (P1 Issue 3). Gmail SMTP is
still configured; Render Free SMTP restrictions and verified delivery need a
separately approved solution. Do not treat email verification as production-ready.

Retain the audit's unresolved items: production CORS/security-header policy,
localStorage token/session policy, OTP plaintext storage and stale pending rows,
account enumeration, query/pagination validation, file-byte validation, and
multi-worker deletion coordination. Some attachment-specific headers are now
implemented; that is not a global application security-header solution.
Never log secrets, passwords, OTPs, signed URLs, or whole provider payloads.

## Verification evidence

The preceding implementation run recorded 96 backend tests and 19 frontend tests
passing, plus frontend build success and Oxlint with 20 existing warnings and no
errors. These are prior recorded results, not tests rerun during consolidation.
Backend flow tests use mocks; direct bcrypt checks use synthetic passwords.
They do not establish live database transactions, email delivery, browser behavior,
or production proxy correctness. Use isolated resources and separate authorization
for integration tests. See the [frontend browser checklist](FRONTEND.md#manual-browser-checklist).
