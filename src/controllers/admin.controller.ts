import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getUsersService, deleteUserService, getReportedUsersService, blockUserService, unblockUserService } from "../services/admin.service";
import { OK } from "../utils/http-status";
import { getReportedCommentsService } from "../services/commentreports.service";

export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const users = await getUsersService();
  res.json({ status: "success", data: users });
  return;
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await deleteUserService(id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ status: "success", message: "User deleted" });
  return;
};

export const getReportedUsers = async (req: Request, res: Response) => {
  const users = await getReportedUsersService();
  res.json({ status: "success", data: users });
  return;
};

export const blockUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await blockUserService(id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ status: "success", message: "User blocked" });
  return;
};

export const unblockUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await unblockUserService(id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ status: "success", message: "User unblocked" });
  return;
};

export const getReportedComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const comments = await getReportedCommentsService();
  res.json({ status: "success", data: comments });
  return;
};