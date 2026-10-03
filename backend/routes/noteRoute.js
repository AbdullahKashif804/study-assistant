const express = require ('express')
const router = express.Router()
const noteController = require('../controllers/noteController')
const authMiddleware = require ('../middleware/authMiddleware.js')
const uploadMiddleware = require('../middleware/uploadMiddleware.js')

router.post('/add',authMiddleware, uploadMiddleware , noteController.addNote)
router.get('/get',authMiddleware,noteController.getNote)
router.get('/get/:id',authMiddleware,noteController.getoneNote)
router.put('/edit/:id',authMiddleware,uploadMiddleware ,noteController.updateNote)
router.delete('/delete/:id',authMiddleware,noteController.deleteNote)

module.exports=router