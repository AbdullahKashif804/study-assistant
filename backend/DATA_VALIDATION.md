# Backend input validation (P1 Issue 6)

Inspection confirmed marks could be compared lexicographically when multipart
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

## Rules and frontend compatibility

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

## Mongoose and scope

Inspection found creates use save(); assignment/project/course/note/profile
updates also use save(). Quiz/daily-task/to-do updates already set runValidators:
true. These validation mechanisms are preserved. Schemas and indexes are
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
cleanup wrapper; see FILE_REPLACEMENT.md. No real uploads were performed.

## Verification

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
