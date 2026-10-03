
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const globalSearch = require("../controllers/globalSearchController");

router.get("/", authMiddleware, globalSearch);

module.exports = router;
