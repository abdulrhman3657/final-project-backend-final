import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getOneUserService,
  getMeService,
  getAllUsersService,
  updateUserByIdService,
} from "../services/users.service";
import { IdeaCollection } from "../models/ideas.model"
import cloudinary from "../utils/cloudinary";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getOneUser = async (req: Request, res: Response) => {
  try {
    const user = await getOneUserService(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await getMeService(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};

export const getMyIdeas = async (req: AuthRequest, res: Response) => {
  try {
    
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const idea = await IdeaCollection.find({founderId: req.user.id})

    if (!idea) {
      res.status(404).json({ message: "ideas not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      data: idea
    });
    
  } catch (err) {
    console.error("Error fetching user ideas:", err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    
    const { profilePic } = req.body;
    const userId = req.user.id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await updateUserByIdService(userId, { profilePic: uploadResponse.secure_url })

    res.status(200).json({
      status: "success",
      data: updatedUser
    });
    
  } catch (err) {
    console.error("Error in updateProfile:", err);
    res.status(500).json({ message: "Failed to update user data" });
  }
};