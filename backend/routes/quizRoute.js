const { validateInput, validateRecordId } = require("../middleware/validateInput");
const express = require('express')
const router =express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const quizController  = require('../controllers/quizController')

router.post('/add',authMiddleware,validateInput("quiz"), quizController.addQuiz)
router.get('/get',authMiddleware,quizController.getQuiz)
router.get('/get/:id',authMiddleware,validateRecordId,quizController.getoneQuiz)
router.put('/edit/:id',authMiddleware,validateRecordId,validateInput("quiz"), quizController.updateQuiz)
router.delete('/delete/:id',authMiddleware,validateRecordId,quizController.deleteQuiz)


module.exports=router