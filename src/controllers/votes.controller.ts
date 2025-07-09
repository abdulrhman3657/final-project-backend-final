import { Request, Response, NextFunction } from "express";
import { getUserVoteService } from "../services/vote.service";
import { getVotesService, postVoteService } from "../services/vote.service";
import { AuthRequest } from "../middleware/auth.middleware"; 
import { OK } from "../utils/http-status";

export const postVote = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ideaId, value } = req.body;
  
      const voteResult = await postVoteService(req.user.id, ideaId, value);
  
      res.status(OK).json({
        status: "success",
        data: voteResult,
      });
    } catch (error) {
      console.error("postVote ERROR:", error);
      next(error);
    }
  };
  
  
  export const getVotes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
  
      const { id } = req.params
  
      const totalVotes =  await getVotesService(id)
      
      res.status(OK).json({
        status: "success",
        data: {
          totalVotes
        },
      });
  
    } catch (error) {
      console.error("getVotes ERROR:", error);
      next(error);
    }
  };


export const getUserVoteController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, ideaId } = req.params;
    const value = await getUserVoteService(userId, ideaId);
    res.status(200).json({ value });
  } catch (err) {
    next(err);
  }
};
