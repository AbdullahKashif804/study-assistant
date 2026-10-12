const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const User = require("../models/Users");
const sendEmail = require("../utils/sendEmail");
const { BCRYPT_COST } = require("../config/password");

const GENERIC = "If this email is registered, a password reset code will be sent. Check your inbox and spam folder.";
const INVALID = "Invalid or expired reset code. Please request a new code.";
const digest = value => crypto.createHash("sha256").update(value).digest("hex");
// A keyed hash prevents offline guessing of the six-digit code from database data alone.
const otpDigest = (nonce, otp) => {
  if (!process.env.JWT_SECRET) throw new Error("Missing signing configuration");
  return crypto.createHmac("sha256", process.env.JWT_SECRET)
    .update(`password-reset:${nonce}:${otp}`).digest("hex");
};

function validatePasswordReset(action) {
  return (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const body = req.body;
    if (!body || typeof body.email !== "string" || body.email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }
    req.body.email = body.email.trim();
    if (action === "verify" && (typeof body.otp !== "string" || !/^\d{6}$/.test(body.otp))) {
      return res.status(400).json({ success: false, message: "Enter the six-digit reset code." });
    }
    if (action === "reset") {
      if (typeof body.resetToken !== "string" || !/^[a-f0-9]{64}$/.test(body.resetToken)) {
        return res.status(400).json({ success: false, message: "Verify a reset code before changing your password." });
      }
      if (typeof body.newPassword !== "string" || body.newPassword.length < 8 ||
          Buffer.byteLength(body.newPassword, "utf8") > 72 || !body.newPassword.trim()) {
        return res.status(400).json({ success: false, message: "Use at least 8 characters and at most 72 UTF-8 bytes for your password." });
      }
      if (body.newPassword !== body.confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match." });
      }
    }
    return next();
  };
}

async function requestPasswordReset(req, res) {
  try {
    const now = new Date();
    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    const nonce = crypto.randomBytes(32).toString("hex");
    // Atomic cooldown also survives restarts and requests routed to different instances.
    const user = await User.findOneAndUpdate({
      email: req.body.email,
      accountDeletionPending: { $ne: true },
      $or: [{ "passwordReset.sentAt": { $exists: false } },
        { "passwordReset.sentAt": { $lte: new Date(now.getTime() - 60000) } }],
    }, { $set: { passwordReset: {
      otpHash: otpDigest(nonce, otp), nonce, attempts: 0,
      sentAt: now, expiresAt: new Date(now.getTime() + 600000),
    } } }, { new: true });
    if (user) {
      await sendEmail(user.email, "Study Assistant Password Reset",
        `Your password reset code is: ${otp}\n\nIt expires in 10 minutes and can only be used once. If you did not request this, ignore this email.`);
    }
  } catch {
    // Same public response for unknown accounts and delivery failures; never log provider data.
    console.error("Password reset request could not be processed.");
  }
  return res.status(200).json({ success: true, message: GENERIC, retryAfter: 60 });
}

async function verifyPasswordReset(req, res) {
  try {
    const user = await User.findOneAndUpdate({
      email: req.body.email, accountDeletionPending: { $ne: true },
      "passwordReset.expiresAt": { $gt: new Date() },
      "passwordReset.otpHash": { $exists: true },
      "passwordReset.attempts": { $lt: 5 },
    }, { $inc: { "passwordReset.attempts": 1 } }, { new: true }).select("+passwordReset");
    if (!user) return res.status(400).json({ success: false, message: INVALID });
    const state = user.passwordReset;
    const expected = otpDigest(state.nonce, req.body.otp);
    if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(state.otpHash, "hex"))) {
      return res.status(400).json({ success: false, message: INVALID });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Compare-and-swap consumes the OTP; only one concurrent verification can win.
    const consumed = await User.updateOne({
      _id: user._id, accountDeletionPending: { $ne: true },
      "passwordReset.otpHash": state.otpHash,
      "passwordReset.expiresAt": { $gt: new Date() },
    }, { $unset: { "passwordReset.otpHash": "", "passwordReset.nonce": "" },
      $set: { "passwordReset.tokenHash": digest(resetToken) } });
    if (!consumed.modifiedCount) return res.status(400).json({ success: false, message: INVALID });
    return res.status(200).json({ success: true, message: "Code verified. Enter your new password.", resetToken });
  } catch {
    console.error("Password reset verification failed.");
    return res.status(500).json({ success: false, message: "Unable to verify the code. Please try again." });
  }
}

async function resetPassword(req, res) {
  try {
    const filter = {
      email: req.body.email, accountDeletionPending: { $ne: true },
      "passwordReset.tokenHash": digest(req.body.resetToken),
      "passwordReset.expiresAt": { $gt: new Date() },
    };
    // Check before expensive bcrypt work; final atomic update rechecks expiry and single use.
    if (!await User.exists(filter)) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset session. Request a new code." });
    }
    const password = await bcrypt.hash(req.body.newPassword, BCRYPT_COST);
    const result = await User.updateOne(filter, {
      $set: { password }, $unset: { passwordReset: "" },
    }, { runValidators: true });
    if (!result.modifiedCount) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset session. Request a new code." });
    }
    return res.status(200).json({ success: true, message: "Password reset successfully. Sign in with your new password." });
  } catch {
    console.error("Password reset could not be completed.");
    return res.status(500).json({ success: false, message: "Unable to reset your password. Please try again." });
  }
}

module.exports = { requestPasswordReset, verifyPasswordReset, resetPassword, validatePasswordReset };
