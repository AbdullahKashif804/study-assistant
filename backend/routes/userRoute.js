const { validateInput } = require("../middleware/validateInput");
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const profileUploadMiddleware = require('../middleware/profileUploadMiddleware');
const { createAuthRateLimiters } = require('../middleware/authRateLimit');
const authLimits = createAuthRateLimiters();


router.post('/signup', authLimits.signUp, validateInput("signup"), userController.SignUp);
router.post('/verify-email', authLimits.verifyEmail, validateInput("verifyEmail"), userController.VerifyEmail);
router.post( '/resend-verification', authLimits.resendVerification, validateInput("resendVerification"), userController.ResendVerificationCode );

router.post('/signin', authLimits.signIn, validateInput("signin"), userController.SignIn);

router.get('/profile', authMiddleware, userController.getProfile);

router.put(
    '/profile/update',
    authMiddleware,
    profileUploadMiddleware,
    validateInput("profile"), userController.updateProfile
);
router.delete(
  '/profile/image',
  authMiddleware,
  userController.deleteProfileImage
);

router.put(
    '/change-password',
    authMiddleware,
    validateInput("password"), userController.changePassword
);
router.delete(
  "/delete-account",
  authMiddleware,
  userController.DeleteAccount
);




module.exports = router;
