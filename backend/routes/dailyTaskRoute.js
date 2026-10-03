const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const dailyTaskController = require('../controllers/dailyTaskController')

router.post('/add',authMiddleware,dailyTaskController.addDailyTask)
router.get('/get',authMiddleware,dailyTaskController.getDailyTask)
router.get('/get/:id',authMiddleware,dailyTaskController.getoneDailyTask)
router.put('/edit/:id',authMiddleware,dailyTaskController.updateDailyTask)
router.delete('/delete/:id',authMiddleware,dailyTaskController.deleteDailyTask)

module.exports = router