import { Router } from "express";
import { authorized } from "../middleware/auth.middleware";
import {
  createIdea,
  deleteIdeaById,
  getAllIdeas,
  getIdeaById,
  ideaAnalatics,
  updateIdeaById,
} from "../controllers/ideas.controller";
import { getUserVoteController } from "../controllers/votes.controller";
import {postVote, getVotes} from "../controllers/votes.controller";

const router = Router();

// Public routes
router.get("/", getAllIdeas);
router.get("/:id", getIdeaById);
router.get("/analytics/:id", ideaAnalatics); // get idea analytics

// Authorized routes
router.post("/", authorized, createIdea);
router.put("/:id", authorized, updateIdeaById); // (only by owner)
router.delete("/:id", authorized, deleteIdeaById); // (only by owner)

// votes
router.get("/vote/:id", getVotes);
router.post("/vote", authorized, postVote);
router.get("/:ideaId/votes/user/:userId/", getUserVoteController);

export default router;
