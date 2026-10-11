const { deliverAttachment } = require("../controllers/attachmentController");
const { validateInput, validateRecordId } = require("../middleware/validateInput");
const express = require('express')
const router = express.Router()
const projectController = require('../controllers/projectController')
const authMiddleware = require ('../middleware/authMiddleware.js')
const uploadMiddleware = require('../middleware/uploadMiddleware.js')

router.post('/add',authMiddleware,uploadMiddleware,validateInput("project"), projectController.addProject)
router.get('/get',authMiddleware,projectController.getProject)
router.get('/get/:id',authMiddleware,validateRecordId,projectController.getoneProject)
router.put('/edit/:id',authMiddleware,validateRecordId,uploadMiddleware,validateInput("project"), projectController.updateProject)
router.delete('/delete/:id',authMiddleware,validateRecordId,projectController.deleteProject)

router.get("/attachment/:id", authMiddleware, validateRecordId, deliverAttachment);

module.exports=router