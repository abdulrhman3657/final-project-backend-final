import { Request, Response, NextFunction } from "express";
import { OK } from "../utils/http-status";
import { AuthRequest } from "../middleware/auth.middleware"; // Import custom request type that extends Request with a user field for authenticated users
import { createtIdeasService, deleteIdeaByIdService, getIdeaAnalyticsService, getIdeaByIdService, getIdeasService, updateIdeaByIdService } from "../services/ideas.service"

export const getAllIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const ideas = await getIdeasService()

    res.status(OK).json({
      status: "success",
      data: ideas,
    });
  } catch (error) {
    console.error("getAllIdeas ERROR:", error);
    next(error);
  }
};

export const createIdea = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, category, mvpLink, targetMarket } = req.body;
    const founderId = req.user.id;

    const newIdea = await createtIdeasService(
      title,
      description,
      category,
      mvpLink,
      founderId,
      targetMarket
    );

    res.status(OK).json({
      status: "success",
      data: newIdea,
    });
  } catch (error) {
    console.error("creatIdea ERROR:", error);
    next(error);
  }
};

export const getIdeaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const idea =  await getIdeaByIdService(id)

    res.status(OK).json({
      status: "success",
      data: idea,
    });
  } catch (error) {
    console.error("getIdeaById ERROR:", error);
    next(error);
  }
};

export const updateIdeaById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const idea = await updateIdeaByIdService(id, req.user.id, updates)

    res.status(200).json({
      status: "success",
      data: idea,
    });
  } catch (error) {
    console.error("updateIdeaById ERROR:", error);
    next(error);
  }
};

export const deleteIdeaById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await deleteIdeaByIdService(id, req.user.id, req.user.role)

    res.status(OK).json({
      status: "success",
      message: "successfully deleted idea",
    });
  } catch (error) {
    console.error("deleteIdeaById ERROR:", error);
    next(error);
  }
};



export const ideaAnalatics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const idea = await getIdeaAnalyticsService(id)

    res.status(OK).json({
      status: "success",
      data: {
        idea,
      },
    });
  } catch (error) {
    console.error("ideaAnalatics ERROR:", error);
    next(error);
  }
};
