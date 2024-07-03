// routes/authRoutes.js
import express from 'express';
import { registerUser, authUser, refreshAccessToken } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

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

export default router;
