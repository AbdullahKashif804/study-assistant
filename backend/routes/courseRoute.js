const express= require ('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const uploadMiddleware = require('../middleware/uploadMiddleware.js')
const courseController = require('../controllers/courseController')

router.post('/add', authMiddleware, uploadMiddleware, courseController.addCourse)
router.get('/get',authMiddleware,courseController.getCourse)
router.get('/get/:id',authMiddleware,courseController.getoneCourse)
router.put('/edit/:id', authMiddleware, uploadMiddleware, courseController.updateCourse)
router.delete('/delete/:id',authMiddleware,courseController.deleteCourse)

module.exports=router

