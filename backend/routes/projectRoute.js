const express = require('express')
const router = express.Router()
const projectController = require('../controllers/projectController')
const authMiddleware = require ('../middleware/authMiddleware.js')
const uploadMiddleware = require('../middleware/uploadMiddleware.js')

router.post('/add',authMiddleware,uploadMiddleware,projectController.addProject)
router.get('/get',authMiddleware,projectController.getProject)
router.get('/get/:id',authMiddleware,projectController.getoneProject)
router.put('/edit/:id',authMiddleware,uploadMiddleware,projectController.updateProject)
router.delete('/delete/:id',authMiddleware,projectController.deleteProject)

module.exports=router