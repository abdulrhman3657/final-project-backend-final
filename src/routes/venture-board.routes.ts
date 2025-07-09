import { Router } from 'express';
import { authorized } from '../middleware/auth.middleware';
import { ventureBoardIdeaDetails, ventureBoardIdeas } from '../controllers/venture-board.controller';


const router = Router();

// GET /api/venture-board Get all ideas that are on the venture board
// GET /api/venture-board/:id Get details of a venture board idea

// // Public routes
router.get('/', ventureBoardIdeas);
router.get('/:id', ventureBoardIdeaDetails);

export default router; 