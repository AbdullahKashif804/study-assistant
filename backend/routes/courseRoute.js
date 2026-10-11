const { deliverAttachment } = require("../controllers/attachmentController");
const { validateInput, validateRecordId } = require("../middleware/validateInput");
const express= require ('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const uploadMiddleware = require('../middleware/uploadMiddleware.js')
const courseController = require('../controllers/courseController')

router.post('/add', authMiddleware, uploadMiddleware, validateInput("course"), courseController.addCourse)
router.get('/get',authMiddleware,courseController.getCourse)
router.get('/get/:id',authMiddleware,validateRecordId,courseController.getoneCourse)
router.put('/edit/:id', authMiddleware,validateRecordId, uploadMiddleware, validateInput("course"), courseController.updateCourse)
router.delete('/delete/:id',authMiddleware,validateRecordId,courseController.deleteCourse)

router.get("/attachment/:id", authMiddleware, validateRecordId, deliverAttachment);

module.exports=router

