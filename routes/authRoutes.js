// routes/authRoutes.js
import express from 'express';
import { registerUser, authUser, refreshAccessToken, deleteUser } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { sendVerificationMail } from './verificationRoute.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/refresh-access-token', refreshAccessToken);

router.get('/profile',protect,(req, res) => {
  return res.json({
    success: true,
    status: 200,
    message:"user fetched successfully.",
    user: req.user,
  });
});

router.post('/send-verification-mail',protect,sendVerificationMail);

router.post('/delete-user',protect,deleteUser);
export default router;
