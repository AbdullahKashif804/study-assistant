const { validateInput, validateRecordId } = require("../middleware/validateInput");
const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const todoTaskController = require('../controllers/todoTaskController')

router.post('/add', authMiddleware, validateInput("todoTask"), todoTaskController.addTodoTask)
router.get('/get', authMiddleware, todoTaskController.getTodoTask)
router.get('/get/:id', authMiddleware,validateRecordId, todoTaskController.getoneTodoTask)
router.put('/edit/:id', authMiddleware,validateRecordId, validateInput("todoTask"), todoTaskController.updateTodoTask)
router.delete('/delete/:id', authMiddleware,validateRecordId, todoTaskController.deleteTodoTask)

module.exports = router