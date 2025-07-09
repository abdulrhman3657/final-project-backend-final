import { CommentVoteCollection } from "../models/commentVotes.model";
import { AppError } from "../utils/error";
import { BAD_REQUEST } from "../utils/http-status";
import {
  getIcommentByIdService,
  updateCommentVoteService,
} from "./comments.service";
import { getOneUserService, updateUserScoreService } from "./users.service";

export const voteCommentService = async (
  commentId: string,
  ideaId: string,
  vote: number,
  userId: string,
) => {
  if (![1, -1, 0].includes(vote)) {
    throw new AppError("Invalid vote value", BAD_REQUEST);
  }

  const existingVote = await CommentVoteCollection.findOne({ userId, commentId });

  const comment = await getIcommentByIdService(commentId);
  const user = await getOneUserService(comment.userId.toString());

  if (vote === 0) {
    if (!existingVote) {
      const updatedComment = await getIcommentByIdService(commentId);
      return {
        message: "no vote to remove",
        totalVotes: {
          totalUpvotes: updatedComment.totalUpvotes,
          totalDownvotes: updatedComment.totalDownvotes,
        },
      };
    }

    await CommentVoteCollection.deleteOne({ userId, commentId });

    const inc = existingVote.vote === 1 ? { totalUpvotes: -1 } : { totalDownvotes: -1 };
    await updateCommentVoteService(commentId, { $inc: inc });

    const scoreDelta = existingVote.vote === 1 ? -1 : 1;
    await updateUserScoreService(comment.userId.toString(), { score: Number(user?.score) + scoreDelta });

  } else if (!existingVote) {
    await CommentVoteCollection.create({ commentId, ideaId, vote, userId });

    const inc = vote === 1 ? { totalUpvotes: 1 } : { totalDownvotes: 1 };
    await updateCommentVoteService(commentId, { $inc: inc });

    const scoreDelta = vote === 1 ? 1 : -1;
    await updateUserScoreService(comment.userId.toString(), { score: Number(user?.score) + scoreDelta });

  } else if (existingVote.vote !== vote) {
    await CommentVoteCollection.updateOne({ userId, commentId }, { vote });

    const voteChange = vote === 1
      ? { totalUpvotes: 1, totalDownvotes: -1 }
      : { totalUpvotes: -1, totalDownvotes: 1 };
    await updateCommentVoteService(commentId, { $inc: voteChange });

    const scoreDelta = vote === 1 ? 2 : -2;
    await updateUserScoreService(comment.userId.toString(), { score: Number(user?.score) + scoreDelta });

  } else {
    const updatedComment = await getIcommentByIdService(commentId);
    return {
      message: "vote unchanged",
      totalVotes: {
        totalUpvotes: updatedComment.totalUpvotes,
        totalDownvotes: updatedComment.totalDownvotes,
      },
    };
  }

  const updatedComment = await getIcommentByIdService(commentId);
  return {
    message: "vote updated",
    totalVotes: {
      totalUpvotes: updatedComment.totalUpvotes,
      totalDownvotes: updatedComment.totalDownvotes,
    },
  };
};

export const getCommentVotesService = async (commentId: string) => {
  const commentVotes = await CommentVoteCollection.find({
    commentId: commentId,
  });

  if (!commentVotes) {
    throw new AppError("comment votes not found", BAD_REQUEST);
  }

  let sum = 0;

  commentVotes.map((commentVote) => {
    sum += commentVote.vote;
  });

  return sum;
};
