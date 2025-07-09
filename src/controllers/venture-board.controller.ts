import { Request, Response } from "express";
import { IdeaCollection } from "../models/ideas.model"
import { getVentureBoardIdeaByIdService, getVentureBoardIdeasService } from "../services/ideas.service";


export const ventureBoardIdeas = async (req: Request, res: Response) => {
  try {

    const ideas = await getVentureBoardIdeasService()

    res.status(200).json({
      status: "success",
      data: ideas
    });

  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const ventureBoardIdeaDetails = async (req: Request, res: Response) => {
  try {

    const { id } = req.params

    const ideas = await getVentureBoardIdeaByIdService(id)

    if (!ideas) {
      res.status(404).json({ message: "no ideas found" });
      return;
    }

    res.status(200).json({
      status: "success",
      data: ideas
    });


  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};