const { limitAI } = require("../middleware/aiWorkload");
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
  limitAI(aiController.generateFromNote)
);

router.post(
  "/notes/ask",
  authMiddleware,
  limitAI(aiController.askNotes)
);
router.post(
  "/study-agent",
  authMiddleware,
  limitAI(aiController.askStudyAgent)
);

module.exports = router;