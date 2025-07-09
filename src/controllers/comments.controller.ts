import { Request, Response, NextFunction } from "express";
import { OK } from "../utils/http-status";
import { AuthRequest } from "../middleware/auth.middleware";
import { createCommentService, deleteCommentService, getCommentsService, getIdeaCommentsService } from "../services/comments.service";
import { getCommentVotesService, voteCommentService } from "../services/commentvotes.service";
import { reportCommentService } from "../services/commentreports.service";


export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const comments = await getCommentsService()

    res.status(OK).json({
      status: "success",
      data: comments
    });

  } catch (error) {
    console.error("getAllIdeas ERROR:", error);
    next(error);
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  const { ideaId, text } = req.body;
  const userId = req.user._id; 

  const comment = await createCommentService(userId, ideaId, text);

  const populatedComment = await comment.populate("userId", "name");

  res.status(201).json({
    success: true,
    data: populatedComment,
  });
};


export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    const { id } = req.params

    await deleteCommentService(id, req.user.id, req.user.role)

    res.status(OK).json({
      status: "success",
      message: "successfully deleted comment"
    });

  } catch (error) {
    console.error("deleteComment ERROR:", error);
    next(error);
  }
};

// get all comments for one idea
export const getIdeaComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    const { id } = req.params

    const comments = await getIdeaCommentsService(id)

    res.status(OK).json({
      status: "success",
      data: comments
    });

  } catch (error) {
    console.error("getIdeaComments ERROR:", error);
    next(error);
  }
};

export const reportComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.body;

    // req.user.id = the reporter id
    const result = await reportCommentService(commentId, req.user.id);

    res.status(OK).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};