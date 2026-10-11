# AI timeout and workload limits (P1 Issue 9)

Historical inspection, before P1 Issue 9, confirmed unlimited external request durations, unbounded document
downloads/extraction, all-library RAG indexing and embedding batches, raw provider
error forwarding, and planner tool/context growth despite its six-step limit.
Existing question lengths, 12,000-character summary input truncation, 1,200/200
chunk size/overlap, top-five retrieval, and 30-record tool limits were present.

Limits are centralized in `backend/config/aiLimits.js`. Groq's existing
openai/gpt-oss-20b model and local Xenova/all-MiniLM-L6-v2 embedding model remain
unchanged. The workload-limit fix preserved providers and prompts. Later attachment privacy
work integrated authenticated document downloads without changing AI models.

| Work | Limit |
| --- | --- |
| Groq request, including streamed body | 30 seconds; aborted on timeout |
| Groq response | 256 KiB; 2,048 completion tokens including reasoning |
| Serialized provider request | 60,000 JavaScript characters |
| Document download | 15 seconds; 10 MiB, checked on headers and streamed bytes |
| PDF/DOCX/PPTX extraction | 20-second worker timeout; 128 MiB old-generation JS heap |
| Extracted text | 50,000 characters |
| Summary/quiz note | 12,000 content characters; 500 title characters |
| RAG/planner questions | 1,000 / 1,500 characters; strings required |
| RAG library | 50 eligible notes, 500 cached chunks overall |
| Source index | 50 chunks per note text or attachment; 1,200 characters/chunk |
| New indexing per request | 100 chunks; embedding batches of eight |
| Cached vector dimensions | At most 384, matching the existing model |
| Planner | Existing six steps, eight total tool calls, 4,000 argument characters/call |
| Planner tool result | 12,000 serialized characters; text fields capped to 500/1,000 characters |
| AI concurrency | Two active requests/process, one per authenticated user |
| AI database reads | 5-second MongoDB execution budget per query |
| Indexing/planner work | 120-second cooperative deadline checked between operations |

RAG note text preflight allows up to 49,498 content characters, reserving space
for title and separators; chunking can impose a slightly lower combined limit.
Queries retain authenticated owner filters, bound record counts, select only
indexing fields, and slice cached arrays before transferring them. Oversized
legacy indexes are rejected rather than silently overwritten. Partial completed
indexing may remain when a later source exceeds a request budget; retrying can
continue within the overall library limits. Existing notes and attachments are
not deleted, truncated in storage, or migrated.

Document parsing runs in a short-lived built-in Node worker so a stuck parser can
be terminated without blocking Express. Its heap limit does not cap all native,
ArrayBuffer, or process memory; pathological documents still warrant stronger
process isolation if public/untrusted usage grows. Concurrent extraction and the
local embedding model need disposable Render memory/latency testing, especially
on the Free plan. No real parser/provider performance was measured in the original workload-limit task.

Embedding inference receives bounded batches and yields between batches. Native
inference and initial model downloads are not hard-cancelled; the cooperative
deadline is not a guaranteed end-to-end HTTP deadline. Concurrency slots stay
held until actual work settles, including after client disconnects. Provider
calls and document workers have independent hard cancellation mechanisms.

Expected errors use sanitized responses: 400 invalid fields, 413 input/workload
limits, 422 document processing failure, 429 AI concurrency, 502 provider/network
or malformed response, 503 missing configuration/model unavailable, and 504
timeout. Unknown exceptions become generic 500 responses. Provider error bodies,
credentials, prompts, model output parse errors, and parser details are not
returned or logged by the new safety utilities. Existing Express JSON-body parser
responses for globally oversized/malformed JSON are outside this route patch.

## Compatibility and remaining risks

- Long notes previously silently truncated for Summary/Quiz now return 413 so
  users know the full material was not processed. Split/shorten the note for AI;
  normal note storage and CRUD are unchanged.
- Large libraries/documents and large planner results may now reject. Splitting
  a document reduces per-source work but not the aggregate library cap. Libraries
  above the overall cap need a separately designed scoped/background retrieval
  workflow, or a measured limit adjustment; this patch does not remove user data.
- Results may be shorter due to token limits; planner tool descriptions may be
  abbreviated. Full provider-response schema validation and calibrated grounding
  thresholds remain separate audit work.
- Concurrency is process-local, not a distributed quota or per-user daily budget.
  Repeated sequential paid requests and multi-instance quota enforcement remain
  separate abuse-control work. No Redis, CAPTCHA, or paid service was introduced.
- Model cold-start transport, native inference cancellation, bounded DB connection
  waiting, and stale-index/concurrent-write coordination remain limitations.

Run `node --test backend/tests/*.test.js`. New tests mock fetch, workers, models,
tool execution, and transformer initialization; they cover ordinary feature
responses, transport/body stalls, safe errors, oversized inputs/downloads, parser
budgets, embedding batches, RAG workload/ownership, planner tool caps, auth route
ordering, and concurrency release. They never download a model, send real AI
requests, or connect to MongoDB/Cloudinary.

Manual browser review: Summary/Quiz generation and saved-content viewing; normal
RAG with notes and supported attachments; planner recommendations and tools;
loading/error messages for 413/429/504; owner isolation and retry behavior. Use
disposable accounts/documents and a separately authorized test deployment for
real provider/parser/Render verification. Production email delivery stays deferred.

## Authenticated document retrieval

Notes RAG now resolves authenticated attachment metadata server-side, using
short-lived Cloudinary download URLs internally and rejecting redirects. Legacy
public files retain a constrained compatibility path. Signed URLs are not returned
to browsers. See [Cloudinary delivery and migration](CLOUDINARY.md).

## Verification provenance

The prior secure-attachment implementation recorded 96 backend and 19 frontend
tests passing. AI tests mock provider fetches, workers, models and embedding
initialization; authenticated RAG tests also mock Cloudinary delivery. Those
results are not a new live AI/parser performance verification. Documentation
consolidation does not rerun application tests or send real provider requests.

[Project overview](../README.md) | [Historical audit](../PROJECT_AUDIT.md)
