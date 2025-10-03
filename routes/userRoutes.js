import express from 'express';
import { getMe } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

// FOR RBAC CONTROL
import { getUsers, createUser, deleteUser } from '../controllers/userController.js';
import { isAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

// Current user info
router.get('/me', protect, getMe);

// Admin-only routes
router.use(protect);      // ensure user is logged in
router.use(isAdmin);      // ensure user is admin

router.get('/', protect, isAdmin, getUsers);         // List all users
router.post('/', protect, isAdmin, createUser);      // Create a new user
router.delete('/:id', protect, isAdmin, deleteUser); // Delete a user by ID

export default router;
