import express from 'express';
import { registerUser, authUser } from '../controllers/authController.js';


// auth middleware testing
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);


// Protected Route (for testing)
router.get("/me", protect, (req, res) => {
  res.json({
    message: "Protected route accessed!",
    user: req.user,
  });
});


export default router;


// How Middleware Works

// When you login, your backend sends a token.

// That token proves your identity (like a digital key).

// When you call /api/auth/me, the middleware:

// Checks Authorization: Bearer <token> in headers.

// Verifies it with jwt.verify.

// Attaches the user (req.user) so routes know who you are.

// If no token or invalid token → request is rejected.