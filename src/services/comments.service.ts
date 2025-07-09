import { CommentCollection } from "../models/comments.model";
import { AppError } from "../utils/error";
import { BAD_REQUEST } from "../utils/http-status";

export const createCommentService = async (
  userId: string,
  ideaId: string,
  text: string
) => {
  return await CommentCollection.create({
    userId,
    ideaId,
    text,
  });
};

export const getCommentsService = async () => {
  const comments = await CommentCollection.find({});

  if (!comments) {
    throw new AppError("no ideas found", BAD_REQUEST);
  }

  return comments;
};

export const deleteCommentService = async (
  id: string,
  userId: string,
  role: string
) => {
  const comment = await CommentCollection.findById(id);

  if (!comment) {
    throw new AppError("comment not found", BAD_REQUEST);
  }

  if (comment.userId.toString() !== userId && role !== "admin") {
    throw new AppError("You are not allowed to perform this task", BAD_REQUEST);
  }

  await CommentCollection.findByIdAndDelete(id);

  return;
};

export const getIdeaCommentsService = async (id: string) => {
  const comments = await CommentCollection.find({ ideaId: id })
    .populate("userId", "name") 
    .select("text userId createdAt totalUpvotes totalDownvotes");

  if (!comments) {
    throw new AppError("comments not found", BAD_REQUEST);
  }

  return comments;
};

export const updateCommentVoteService = async (
  commentId: string,
  updates: Object
) => {
  const comment = await CommentCollection.findOne({ _id: commentId });

  if (!comment) {
    throw new AppError("comments not found", BAD_REQUEST);
  }

  const updatedComment = await CommentCollection.findByIdAndUpdate(
    commentId,
    updates,
    {
      new: true,
    }
  );

  return updatedComment;
};

export const getIcommentByIdService = async (commentId: string) => {
  const comments = await CommentCollection.findOne({ _id: commentId });

  if (!comments) {
    throw new AppError("no ideas found", BAD_REQUEST);
  }

  return comments;
};
