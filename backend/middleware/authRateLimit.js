const { createHash } = require("node:crypto");
const { isIP } = require("node:net");

// Use Express's trusted req.ip, never a client-supplied header directly.
function clientKey(req) {
  const ip = (req.ip || req.socket?.remoteAddress || "unknown").split("%")[0];
  if (isIP(ip) !== 6) return ip;
  const canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
  const [left, right = ""] = canonical.split("::");
  const start = left ? left.split(":") : [];
  const end = right ? right.split(":") : [];
  const words = canonical.includes("::")
    ? [...start, ...Array(8 - start.length - end.length).fill("0"), ...end]
    : start;
  const numbers = words.map(word => parseInt(word, 16));
  if (numbers.slice(0, 5).every(word => word === 0) && numbers[5] === 65535) {
    return [numbers[6] >> 8, numbers[6] & 255, numbers[7] >> 8, numbers[7] & 255].join(".");
  }
  // Group IPv6 clients by /56 so rotating addresses in a subnet cannot bypass limits.
  return `ipv6:${numbers.slice(0, 3).join(":")}:${numbers[3] >> 8}`;
}

function emailKey(req) {
  if (typeof req.body?.email !== "string") return null;
  const email = req.body.email.trim().toLowerCase();
  if (!email) return null;
  return createHash("sha256").update(email).digest("hex");
}

function createAuthRateLimiters({ now = Date.now, maxEntries = 10000 } = {}) {
  const buckets = new Map();
  let nextSweep = 0;
  const minute = 60 * 1000;
  const rule = (name, max, windowMs, key) => ({ name, max, windowMs, key });

  function middleware(rules) {
    return (req, res, next) => {
      const time = now();
      if (time >= nextSweep) {
        for (const [key, bucket] of buckets) {
          if (bucket.resetAt <= time) buckets.delete(key);
        }
        nextSweep = time + minute;
      }
      for (const policy of rules) {
        const identity = policy.key(req);
        if (identity === null) continue; // Invalid fields still consume the IP budget.
        const key = `${policy.name}:${identity}`;
        let bucket = buckets.get(key);
        if (bucket && bucket.resetAt <= time) {
          buckets.delete(key);
          bucket = undefined;
        }
        if (!bucket && buckets.size < maxEntries) {
          bucket = { count: 0, resetAt: time + policy.windowMs };
          buckets.set(key, bucket);
        }
        // Fail closed under capacity pressure instead of evicting active limits.
        if (!bucket || bucket.count >= policy.max) {
          const seconds = bucket ? Math.max(1, Math.ceil((bucket.resetAt - time) / 1000)) : 60;
          res.setHeader("Retry-After", String(seconds));
          res.setHeader("Cache-Control", "no-store");
          return res.status(429).json({
            success: false,
            message: "Too many authentication requests. Please try again later.",
          });
        }
        bucket.count++;
      }
      return next();
    };
  }

  // Signup and resend share both email budgets; neither can bypass the other.
  const deliveryRules = [
    rule("delivery-email", 5, 60 * minute, emailKey),
    rule("delivery-cooldown", 1, minute, emailKey),
  ];
  return {
    signIn: middleware([
      rule("signin-ip", 20, 15 * minute, clientKey),
      rule("signin-email", 10, 15 * minute, emailKey),
    ]),
    signUp: middleware([rule("signup-ip", 10, 60 * minute, clientKey), ...deliveryRules]),
    verifyEmail: middleware([
      rule("verify-ip", 30, 10 * minute, clientKey),
      rule("verify-email", 5, 10 * minute, emailKey),
    ]),
    resendVerification: middleware([rule("resend-ip", 10, 60 * minute, clientKey), ...deliveryRules]),
  };
}

module.exports = { createAuthRateLimiters };
