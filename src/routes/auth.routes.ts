import { Router } from 'express';
import { authorized } from '../middleware/auth.middleware'; // custom middleware to checks if the user is authenticated before accessing the routes
import * as AuthController from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/signout', AuthController.signOut);

// Authorized routes
router.delete('/delete-account', authorized, AuthController.deleteAccount);

export default router; 