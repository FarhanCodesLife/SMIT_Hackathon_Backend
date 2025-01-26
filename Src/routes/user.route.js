import express from 'express';
import {
  createUser,
  logInUser,
  resetPassword,
  refreshToken,
  logoutUser,
  getAllUsers,
} from '../controllers/user.controllers.js';

const router = express.Router();

// Route for creating a new user
router.post('/register', createUser);

// Route for logging in a user
router.post('/login', logInUser);

// Route for resetting the user's password
router.post('/reset-password', resetPassword);

// Route for refreshing the access token using the refresh token
router.post('/refresh-token', refreshToken);

// Route for logging out the user
router.post('/logout', logoutUser);

// Route for getting all users (this can be restricted to admin roles)
router.get('/users', getAllUsers);

export default router;
