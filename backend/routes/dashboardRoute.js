const express = require('express')

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')

const dashboardController = require('../controllers/dashboardController')

const deadlinePopupController = require('../controllers/deadlinePopupController')

router.get('/get', authMiddleware, dashboardController.showDashboard)

router.get(
    "/deadline-reminders",
    authMiddleware,
    deadlinePopupController.getDeadlineReminders
);

module.exports = router