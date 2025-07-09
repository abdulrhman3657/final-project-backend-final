import { Router } from 'express';
import { authorized } from '../middleware/auth.middleware';
import { createComment, deleteComment, getComments, getIdeaComments, reportComment } from '../controllers/comments.controller';
import {getCommentVotes, voteComment} from '../controllers/commentVotes.controller';

const router = Router();

router.get('/', getComments); // get all comments
router.get('/idea/:id', getIdeaComments); // get all comments for one idea by its id, id = idea id

router.post('/idea/:id', authorized, createComment);
router.delete('/:id', authorized, deleteComment); // Delete a comment by id

// comment votes
router.post('/vote', authorized, voteComment);
router.get('/vote/:id', getCommentVotes);

// report comment
router.post("/report", authorized, reportComment);

export default router; 