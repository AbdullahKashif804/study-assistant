const express = require('express')
const router =express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const quizController  = require('../controllers/quizController')

router.post('/add',authMiddleware,quizController.addQuiz)
router.get('/get',authMiddleware,quizController.getQuiz)
router.get('/get/:id',authMiddleware,quizController.getoneQuiz)
router.put('/edit/:id',authMiddleware,quizController.updateQuiz)
router.delete('/delete/:id',authMiddleware,quizController.deleteQuiz)


module.exports=router