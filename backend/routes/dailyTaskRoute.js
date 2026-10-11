const { validateInput, validateRecordId } = require("../middleware/validateInput");
const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const dailyTaskController = require('../controllers/dailyTaskController')

router.post('/add',authMiddleware,validateInput("dailyTask"), dailyTaskController.addDailyTask)
router.get('/get',authMiddleware,dailyTaskController.getDailyTask)
router.get('/get/:id',authMiddleware,validateRecordId,dailyTaskController.getoneDailyTask)
router.put('/edit/:id',authMiddleware,validateRecordId,validateInput("dailyTask"), dailyTaskController.updateDailyTask)
router.delete('/delete/:id',authMiddleware,validateRecordId,dailyTaskController.deleteDailyTask)

module.exports = router