const { deliverAttachment } = require("../controllers/attachmentController");
const { validateInput, validateRecordId } = require("../middleware/validateInput");
const express= require ('express')
const router = express.Router()
const assignmentController = require('../controllers/assignmentController')
const authMiddleware = require('../middleware/authMiddleware')
const uploadMiddleware = require('../middleware/uploadMiddleware.js')

router.post('/add',authMiddleware,uploadMiddleware,validateInput("assignment"), assignmentController.addAssignment)
router.get('/get',authMiddleware,assignmentController.getAssignment)
router.get('/get/:id',authMiddleware,validateRecordId,assignmentController.getoneAssignment)
router.put('/edit/:id',authMiddleware,validateRecordId,uploadMiddleware,validateInput("assignment"), assignmentController.updateAssignment)
router.delete('/delete/:id',authMiddleware,validateRecordId,assignmentController.deleteAssignment)

router.get("/attachment/:id", authMiddleware, validateRecordId, deliverAttachment);

module.exports=router