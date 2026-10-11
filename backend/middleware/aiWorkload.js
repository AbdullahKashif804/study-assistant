// Hold slots until work actually settles, even when a client disconnects.
let active = 0;
const users = new Set();
function limitAI(handler) {
  return async (req, res, next) => {
    const user = String(req.user._id);
    if (active >= 2 || users.has(user)) {
      res.setHeader("Retry-After", "5");
      return res.status(429).json({ success: false, message: "AI is busy. Please try again shortly." });
    }
    active++; users.add(user);
    try { return await handler(req, res, next); }
    finally { active--; users.delete(user); }
  };
}
module.exports = { limitAI };
