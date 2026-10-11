const { deliverAttachment } = require("../controllers/attachmentController");
const { validateInput, validateRecordId } = require("../middleware/validateInput");
const express = require ('express')
const router = express.Router()
const noteController = require('../controllers/noteController')
const authMiddleware = require ('../middleware/authMiddleware.js')
const uploadMiddleware = require('../middleware/uploadMiddleware.js')

router.post('/add',authMiddleware, uploadMiddleware , validateInput("note"), noteController.addNote)
router.get('/get',authMiddleware,noteController.getNote)
router.get('/get/:id',authMiddleware,validateRecordId,noteController.getoneNote)
router.put('/edit/:id',authMiddleware,validateRecordId,uploadMiddleware ,validateInput("note"), noteController.updateNote)
router.delete('/delete/:id',authMiddleware,validateRecordId,noteController.deleteNote)

router.get("/attachment/:id", authMiddleware, validateRecordId, deliverAttachment);

module.exports=router