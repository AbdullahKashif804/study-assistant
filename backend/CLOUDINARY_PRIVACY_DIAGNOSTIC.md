# Isolated authenticated raw-PDF compatibility diagnostic

Prepared only; live compatibility has NOT been verified. This is not an application
privacy fix or a migration. Existing public attachments remain public.

## Explicit authorization and execution

Do not run until the account owner explicitly approves this disposable live test.
From the project root, in PowerShell:

```powershell
Set-Location backend
node scripts/cloudinaryPrivacyDiagnostic.js --confirm-cloudinary-test
```

The flag explicitly authorizes one new diagnostic upload, its delivery checks,
and cleanup of that diagnostic asset only. Without the flag (including `--help`),
the script prints instructions and performs no cloud operations or environment
loading. Never paste credentials into the command line.

At authorized runtime only, dotenv loads `backend/.env` quietly, preserving
already-set process environment values. The existing `config/cloudinary.js`
supplies the SDK configuration. No environment file is edited or printed.
Node 18+ with global fetch is required; use the project's current supported Node.
No database or application server is loaded. No new dependency is needed.

## Procedure and expected results

1. Generate a tiny, new PDF containing only a generic diagnostic sentence in a
   fresh OS temporary directory. No existing local study file is used.
2. Print the diagnostic public ID for interruption recovery (not a credential).
3. Upload using `resource_type: raw`, `type: authenticated`, a UUID namespace,
   and `overwrite: false`. Verify returned ID, resource type, and delivery type.
4. Request unsigned authenticated delivery AND the equivalent public upload
   path with no cookies or authorization headers. Both must return 401/403/404.
   Network errors, redirects, and other statuses fail rather than count as denial.
5. Generate a server-side `private_download_url` using the exact raw public ID,
   PDF format, authenticated delivery type, and a 60-second expiry. Retrieve it
   only in memory on the backend and compare every byte with the uploaded PDF.
   URLs, credentials, response bodies, and raw SDK errors are never printed.
6. Destroy only the generated raw/authenticated ID with cache invalidation.
   `ok` or `not found` confirms cleanup; up to three bounded attempts are made.
7. Unlink only the generated local PDF and remove only its now-empty directory.

Exit 0 and `OVERALL PASS` require both compatibility checks and cleanup to succeed.
Exit 1 / `OVERALL FAIL` means a check or cleanup failed; no privacy claims should
be made. The test deliberately does not fall back to public uploads or alternate
providers if authenticated raw delivery fails.

## Cleanup and recovery

Cleanup runs in `finally` after success and handled failures, including ambiguous
upload errors. The cleanup target is the locally generated UUID, never an ID
supplied by Cloudinary, a database record, or a command-line argument. A reported
existing-asset collision skips cloud deletion entirely. Profile images and study
attachments are never referenced.

If cleanup cannot be confirmed, retain the printed diagnostic ID and manually
review ONLY that ID with resource type `raw` and delivery type `authenticated`.
Do not delete similarly named folders, use bulk deletion, or target public assets.
An abrupt process kill, machine crash, or outage can prevent cleanup; there is no
durable retry worker. Retain the ID before starting the upload. Local cleanup
failure reports no sensitive path; look for the fresh `study-cloudinary-diagnostic-`
directory in the OS temporary directory, and inspect before removing anything.

Cloud calls have SDK timeouts (60s upload, 30s per cleanup attempt). Retrieval has
a 15s connection/body deadline, a 64KiB body cap, HTTPS Cloudinary-host checks,
and redirects disabled. Upstream account policies that require redirects will
produce a safe failure requiring investigation, not automatic URL forwarding.

## Offline verification

```powershell
node --test tests/cloudinaryPrivacyDiagnostic.test.js
```

These tests mock the SDK and HTTP responses, using disposable local files only.
They do not load environment configuration or contact Cloudinary. They validate
control flow and cleanup, not account compatibility. Live success also does not
establish expired-link rejection, application ownership authorization, migration
safety, all file-format compatibility, or resistance to every CDN-cache scenario.

## References

- https://cloudinary.com/documentation/image_upload_api_reference
- https://cloudinary.com/documentation/control_access_to_media

The installed SDK's `private_download_url` signs `public_id`, `format`, `type`,
and `expires_at`, and targets the selected resource-type download endpoint.
The diagnostic tests this mechanism against the account; it does not assume
authenticated raw-document compatibility based solely on SDK support.
