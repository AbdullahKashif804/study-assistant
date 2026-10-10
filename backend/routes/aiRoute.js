const express = require("express");

const router = express.Router();

const aiController = require(
  "../controllers/aiController"
);

const authMiddleware = require(
  "../middleware/authMiddleware"
);

router.post(
  "/note/:id/generate",
  authMiddleware,
  aiController.generateFromNote
);

router.post(
  "/notes/ask",
  authMiddleware,
  aiController.askNotes
);
router.post(
  "/study-agent",
  authMiddleware,
  aiController.askStudyAgent
);

module.exports = router;