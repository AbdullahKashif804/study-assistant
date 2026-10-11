# Frontend layout, colors and verification

[Project overview](../README.md) | [Historical audit](../PROJECT_AUDIT.md) | [Attachment access](CLOUDINARY.md#authorized-delivery)

## Shared page structure

Assignments is the CRUD design reference. Notes, Assignments, Projects, Courses,
Quizzes, Daily Tasks and To-Do Tasks follow the same heading/action, toolbar,
meaningful statistics, vertical record list, Create/Edit form and record-container
pagination structure. ModuleLayout, ModuleColumns and ModuleRecords are reused
where implemented; Assignments retains its reference layout. Specialized Dashboard,
Profile, Settings, Admin, Auth, Home and Legal pages keep their own structures.
The dashboard preserves AI Study Planner, Task Progress, Recent & Upcoming and
Quick Actions.

Useful shared helpers remain: ModuleForm, Modal, Pagination, StatCard,
useFormDraft and useResponsiveDialog. Module forms keep all fields, submission
handlers, validation and upload acceptance. Shared styling lives in
`frontend/src/index.css`. Native dialogs handle focus containment/restoration and
Escape; pending saves disable controls and block Escape/backdrop closing.
Field validation feedback is visible and requests focus. Verify desktop error
focus separately: a visible desktop form can have isFormOpen false.

## Responsive behavior

- Desktop (1024px+): permanent sidebar, content below the 64px header, records
  left, sticky height-limited independently scrolling form right.
- Tablet (768?1023px): full-width records, modal navigation drawer and centered
  scrollable Create/Edit dialog. Toolbars and statistics wrap.
- Mobile (below 768px): single-column records, full-width Create action,
  two-column statistics where meaningful and full-screen scrolling forms.
  Dynamic viewport height, safe-area padding and keyboard viewport metadata help
  avoid clipping; actual browser/keyboard behavior still needs verification.

Notes, Daily Tasks and To-Do Tasks use backend pagination. Other modules report
honest single-page counts. Pagination clamps stale pages and normalizes empty
results; To-Do filters reset to page 1. Task page-local statistics should not be
presented as account-wide totals.

## Module-specific behavior

- Notes retain attachments, Ask Your Study Material, AI Summary and AI Quiz.
  Saved results show View Summary/View Quiz; otherwise buttons generate content;
  pending generation shows Generating. Notes cards can legitimately be taller.
  Phase B reduced the AI-row margin/gap to 12px/8px and created-date margin to 12px
  without hiding content. The large writing field is intentional.
- Projects retain technologies, course relationships, status, marks, deadlines
  and attachments. Their additional fields can make forms taller.
- Courses preserve profile-semester defaults, manual overrides, editing of stored
  semesters, instructor/code fields and attachments. Profile promotion never
  rewrites existing course semesters.
- Quizzes retain course subtitles, status, score, deadline and computed status.
- Daily Tasks preserve completion checkboxes, completed styling, priority/date
  metadata and pagination. To-Do Tasks preserve accessible checkbox labels,
  overdue styling, priorities, dates and pagination.
- New study attachments use authenticated Fetch and local Blob previews/downloads.
  Legacy attachments are labeled public. Popup blocking, expiry, cleanup and
  privacy limitations are documented in [Cloudinary](CLOUDINARY.md).

## Semantic colors

| Meaning | Styling |
| --- | --- |
| Primary actions and active navigation | Indigo 600; hover Indigo 700 |
| Information and informational links | Blue |
| Success/completed/verified | Emerald |
| Destructive actions and errors | Red |
| Backgrounds, borders and ordinary text | Neutral slate/gray/white |

Shared primary styles include focus, disabled and loading states. Module category
colors and dashboard chart palettes are preserved where meaningful. Light/dark
mode remains supported. The original color review noted that Profile's shared
feedback slot uses one informational color for both success and error messages;
verify current behavior before a separately scoped semantic-feedback change.

## Draft protection and known limitations

Close hides a form without clearing its values. Cancel/Clear/reset and switching
records ask before discarding changed fields or attachments. Ordinary sidebar
anchor navigation and refresh/tab-close are guarded. Supported cancellable
same-document Back/Forward events are guarded through the browser Navigation API.
Unsupported/non-cancellable history traversals, programmatic navigate() calls,
global-search result buttons and same-path query transitions are not universally
blocked by the existing BrowserRouter guard. beforeunload prompts depend on browser
restrictions. A comprehensive router blocker needs separately scoped work.

Each dialog currently snapshots/restores body overflow independently. Overlapping
drawers/forms/AI dialogs may restore scrolling incorrectly; verify overlap and
breakpoint transitions. Explicit label associations, checkbox-label layout,
keyboard menus/combobox semantics, localStorage parsing, request cancellation and
effect dependencies remain audit concerns; do not claim all are resolved by UI
standardization.

## Historical implementation and verification

Earlier standardization addressed mixed form breakpoints/drawers, duplicate
statistics/pagination markup, page-local counts, missing toolbar labels, clipped
menus and workspace offsets. Phase A corrected Notes/Projects layout, introduced
ModuleLayout and added supported history traversal guarding. Phase B applied the
approved pattern to the other four modules and removed confirmed unused imports
and duplicate wrappers. These are historical implementation records, not browser
proof that every reported positioning issue is resolved.

Earlier UI reports recorded 9 then 10 mocked frontend tests, 11 mocked backend
tests, successful builds, and lint warnings falling from 22 to 20. Those counts
belong to their respective tasks. The latest preceding attachment implementation
recorded 19 frontend tests, 96 backend tests, a successful production build, and
Oxlint with 20 existing warnings and zero errors. The large (>500 kB) JS bundle
warning remains. No application tests, browser/device checks or live CRUD calls
are run during documentation consolidation. Mocked hook tests do not establish
actual React rendering, browser dialog semantics or device accessibility.

## Manual browser checklist

- Inspect 375, 768, 1023, 1024, 1280 and 1440px in both themes: header/sidebar
  alignment, no Notes blank region, list/form proportions, toolbar/statistics,
  pagination, long titles/filenames, metadata wrapping and action-menu boundaries.
- Create/Edit/Delete each module; check required fields, marks (9/100, zero,
  decimals, blank), statuses, course relationships, semester defaults/overrides
  and profile promotion without rewriting old courses. Validation failures must
  preserve drafts. Check loading/empty/error/success states and filter/page edges.
- Exercise independent form scrolling, long uploads/forms, mobile keyboard,
  Tab/Shift+Tab, Escape, backdrop closing, focus return and simultaneous dialogs.
- Verify Close/reopen retains drafts and Cancel/Clear/record switching prompts.
  Test sidebar navigation, global-search navigation, Back/Forward, refresh and
  tab-close with the documented browser limitations.
- Check owner attachment previews/downloads, expired JWT, cross-user denial,
  legacy labels, popup blocking, replacement/deletion with a captured old
  application URL, supported document types and Notes RAG.
- Check Notes generation/saved-result viewing, study planner, task completion,
  deadline popup dismissal, notifications, Profile, Settings, Admin visibility
  and authentication. Live checks require disposable data and separate approval.

Run from the repository root: `node --test frontend/tests/*.test.mjs`.
Run `npm run build` and `npm run lint` in frontend; configured lint is Oxlint.
