const express= require ('express')
const router = express.Router()
const assignmentController = require('../controllers/assignmentController')
const authMiddleware = require('../middleware/authMiddleware')
const uploadMiddleware = require('../middleware/uploadMiddleware.js')

router.post('/add',authMiddleware,uploadMiddleware,assignmentController.addAssignment)
router.get('/get',authMiddleware,assignmentController.getAssignment)
router.get('/get/:id',authMiddleware,assignmentController.getoneAssignment)
router.put('/edit/:id',authMiddleware,uploadMiddleware,assignmentController.updateAssignment)
router.delete('/delete/:id',authMiddleware,assignmentController.deleteAssignment)

module.exports=router