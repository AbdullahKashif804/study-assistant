const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const profileUploadMiddleware = require('../middleware/profileUploadMiddleware');


router.post('/signup', userController.SignUp);
router.post('/verify-email', userController.VerifyEmail);
router.post( '/resend-verification', userController.ResendVerificationCode );

router.post('/signin', userController.SignIn);

router.get('/profile', authMiddleware, userController.getProfile);

router.put(
    '/profile/update',
    authMiddleware,
    profileUploadMiddleware,
    userController.updateProfile
);
router.delete(
  '/profile/image',
  authMiddleware,
  userController.deleteProfileImage
);

router.put(
    '/change-password',
    authMiddleware,
    userController.changePassword
);
router.delete(
  "/delete-account",
  authMiddleware,
  userController.DeleteAccount
);




module.exports = router;