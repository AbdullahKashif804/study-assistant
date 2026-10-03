const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const todoTaskController = require('../controllers/todoTaskController')

router.post('/add', authMiddleware, todoTaskController.addTodoTask)
router.get('/get', authMiddleware, todoTaskController.getTodoTask)
router.get('/get/:id', authMiddleware, todoTaskController.getoneTodoTask)
router.put('/edit/:id', authMiddleware, todoTaskController.updateTodoTask)
router.delete('/delete/:id', authMiddleware, todoTaskController.deleteTodoTask)

module.exports = router