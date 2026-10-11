# Authentication request limits

Only the four public POST authentication endpoints are limited. Authenticated CRUD,
profile, password-change, and deletion routes retain their existing middleware.
No dependencies, database schemas, JWT logic, OTP generation/expiry, or email
transport were changed.

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

## Proxy assumptions

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

## Limitations and recovery

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
- Fixed windows permit bursts around boundaries. Distributed bot traffic, AI abuse
  limits, and durable per-OTP attempt counters remain separate work.
- Existing controller messages reveal user/pending-signup existence. New limiter
  responses do not add that disclosure. Existing validation/NoSQL input concerns,
  password policy, OTP storage, and email transport are unchanged.

Run `node --test backend/tests/*.test.js` from the project root. Tests use isolated
clocks and mocked database/email operations; proxy tests exercise Express request
IP resolution without opening a socket. No real OTP/email requests are made.
Manual browser checks: normal signup/verify/login/resend, displayed 429 messages,
recovery after Retry-After, and unaffected authenticated CRUD. Email transport
replacement remains deferred.
