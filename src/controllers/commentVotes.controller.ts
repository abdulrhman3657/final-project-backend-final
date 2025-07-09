import { Request, Response, NextFunction } from "express";
import { OK } from "../utils/http-status";
import { AuthRequest } from "../middleware/auth.middleware";
import { getCommentVotesService, voteCommentService } from "../services/commentvotes.service";

export const voteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
  
      const { ideaId, commentId, vote } = req.body
  
      const commentVote = await voteCommentService(commentId, ideaId, vote, req.user.id)
  
      res.status(OK).json({
        status: "success",
        data: commentVote
      });
  
    } catch (error) {
      console.error("getIdeaComments ERROR:", error);
      next(error);
    }
  };
  
  export const getCommentVotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
  
      const { id } = req.params
  
      const totalCommentVotes = await getCommentVotesService(id)
  
      res.status(OK).json({
        status: "success",
        totalCommentVotes
      });
  
    } catch (error) {
      console.error("getIdeaComments ERROR:", error);
      next(error);
    }
  };