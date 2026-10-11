# Attachment privacy — new uploads and legacy migration plan

## Implemented policy

New Notes, Assignments, Projects and Courses attachments use Cloudinary
`type: authenticated`, with overwrite disabled. Metadata stores `deliveryType`,
`resourceType`, and `publicId`. Only an unsigned, inaccessible Cloudinary URL is
stored/returned for authenticated assets. No signed access URL is sent to browsers.
Profile uploads retain their existing public policy and schema.

Missing deliveryType means **legacy public** (`upload`), including old documents
read through the schema default. The four card components explicitly label these
files `(legacy public)`. They remain publicly accessible to anyone holding their
original URL until a separately authorized migration removes that public copy.
Changing database metadata alone cannot secure a public asset.

## Authorized delivery

Each module provides `GET /api/{note|assignment|project|course}/attachment/:id`.
It requires the existing JWT middleware and valid record ID. The controller
queries `{ _id: recordId, user: authenticatedUserId }`; client IDs never authorize
Cloudinary access. `version=<publicId>` must equal the current attachment's ID.
This is a stale-reference check, not an authorization credential. `download=1`
requests attachment disposition; otherwise safe image/PDF previews are inline.
An owner-scoped recheck after upstream headers rejects deletion or replacement
that happened while connecting. Missing/unowned/stale/cloud-absent files return
404; missing JWT returns 401.

The backend signs a 60-second Cloudinary download URL and fetches it internally.
Legacy files use the stored URL only after HTTPS/cloud-origin validation.
No redirects, upstream cookies, signed URLs, provider bodies or Location headers
are forwarded. Stream pipeline backpressure avoids buffering the whole file on
the server. Limits are 30 seconds total network/stream time and 10 MiB per file,
both declared and actually streamed. Oversized declared responses return 413;
late streaming failures terminate the response because headers may already be
sent. Timeouts before headers return 504; other retrieval failures return 502.

Responses use private/no-store cache control, nosniff, sandbox CSP, safe filename
characters, and an explicit MIME allowlist. Unknown formats and Office documents
download instead of executing inline. Frontend bearer-authenticated Fetch creates
local Blob previews/downloads; it never puts JWTs into URLs. Preview Blob URLs
are revoked when the window closes or after ten minutes, download Blob URLs after
one minute. Popup blocking produces instructions to allow previews or download.
Files are at most 10 MiB but are buffered in browser memory for this JWT flow.

Notes RAG resolves the same authenticated asset metadata server-side, retaining
AI download/text/workload limits and rejecting redirects. Replacement compensation,
old-file deletion, ordinary CRUD deletion, and account deletion use delivery type.
Account deletion resource identity now includes delivery type. Public profiles
and legacy attachments continue using `upload`; authenticated cleanup requests
cache invalidation. Existing replacement commit/compensation ordering and local
temporary-file cleanup are preserved.

## Limits and remaining risks

- Already downloaded files, in-memory previews and streams authorized before a
  deletion cannot be recalled. Every new endpoint request is checked, but there
  is no continuous database permission check during an active stream.
- Backend-only signed URLs remain valid until their expiry. Do not log them or
  include them in telemetry. Network/provider logs require operational review.
- No public assets were migrated, inspected live, deleted or modified by this task.
  Cloudinary account compatibility was confirmed separately by the user (CLOUD-001).
- Legacy URLs must use HTTPS `res.cloudinary.com/<configured-cloud>/...` with no
  query/credentials. Imported custom-CDN or signed legacy URLs require trusted
  review rather than automatic redirects or permissive URL fetching.
- File MIME/extension checking is not a malware scanner. Uploaded documents and
  images should still be treated as untrusted files by users and their viewers.
- Normal CRUD/account deletion retains its existing external-failure/manual-retry
  limitations. No durable cleanup queue or migration executor is added.
- Streaming through Render adds server bandwidth/connections; concurrency and
  account quotas require operational monitoring. Native PDF viewer/mobile behavior,
  real Mongoose serialization and Cloudinary image delivery need browser/integration
  verification. A server-side MIME/CSP header is not carried onto browser Blob URLs;
  the client deliberately restricts inline Blob types to PDF and raster images.

## Migration preparation — DO NOT execute without separate approval

1. **Inventory (read-only, separately authorized):** owner ID, module/record ID,
   public ID, resource/delivery type, format, bytes, stored URL, shared references,
   and Cloudinary asset ID/version. Cross-check resource existence. Exclude public
   profile images. Treat missing delivery type as legacy, not proof of cloud state.
2. **Backup:** encrypted database snapshot/metadata journal plus verified file
   backups or confirmed Cloudinary backup coverage. Restrict backup access; avoid
   adding secrets, URLs or user documents to Git. Record hashes for byte integrity.
3. **Pilot:** use disposable records/assets first. Exercise raw PDF/DOCX/PPTX and
   accepted image formats. Verify unsigned original/transformed access denial,
   owner streaming, cross-owner/unauthenticated denial, RAG and cleanup.
4. **Migration:** prefer copy-and-verify into a fresh authenticated public ID to
   preserve rollback while checking integrity. Journal each step. Use a conditional
   MongoDB update matching the original owner/record/reference so concurrent edits
   are never overwritten. Update delivery metadata and unsigned URL together.
   Reset attachment RAG indexing metadata when public ID changes, following the
   existing replacement invalidation behavior. Keep batches bounded.
5. **Retire public originals:** only after protected access is verified and all
   shared references are accounted for, separately authorize destruction of exact
   old resource/type/ID tuples with cache invalidation. Poll old unsigned URLs and
   relevant derivatives until inaccessible; CDN invalidation is not instantaneous.
   Mark records protected only after public copies are retired and verified.
6. **Retry/recovery:** journal pending-copy, copied, DB-switched, public-retirement
   pending, verified, and failed states. Never infer success from a network timeout.
   Reconcile both MongoDB and Cloudinary before retrying; use exact immutable
   identities and conditional updates. Preserve recovery references on failures.
7. **Rollback:** before public retirement, a conditional DB switch-back can restore
   compatibility but deliberately restores exposure and requires security approval.
   Prefer fixing protected delivery. After public retirement, recover into protected
   storage from backups; do not silently recreate public files. Never bulk-delete a
   folder or roll back unrelated user edits.

## Verification checklist

Automated tests use mocks/isolated memory, never live MongoDB/Cloudinary. Browser
review must cover all four modules, both modes and mobile: create an attachment,
preview/download, expired JWT, another account's record ID, legacy label/access,
replace then retry a previously captured application URL, delete then retry,
Notes document questions, cancelled/broken downloads and popup blocking. Use
disposable accounts/assets only after separately authorizing live operations.
