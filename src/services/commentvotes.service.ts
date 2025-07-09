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

  const existingVote = await CommentVoteCollection.findOne({
    userId,
    commentId,
  });

  const comment = await getIcommentByIdService(commentId);
  const user = await getOneUserService(comment.userId.toString());

  if (existingVote) {
    if (vote === 0 || existingVote.vote === vote) {
      await CommentVoteCollection.deleteOne({ _id: existingVote._id });
      if (existingVote.vote === 1) {
        await updateUserScoreService(comment.userId.toString(), {
          score: Number(user?.score) - 1,
        });
        await updateCommentVoteService(commentId, {
          totalUpvotes: comment.totalUpvotes - 1,
        });
      } else {
        await updateUserScoreService(comment.userId.toString(), {
          score: Number(user?.score) + 1,
        });
        await updateCommentVoteService(commentId, {
          totalDownvotes: comment.totalDownvotes - 1,
        });
      }

      const updatedComment = await getIcommentByIdService(commentId);
      return {
        vote: 0,
        upvotes: updatedComment.totalUpvotes,
        downvotes: updatedComment.totalDownvotes,
      };
    }

    if (vote === 1) {
      await updateUserScoreService(comment.userId.toString(), {
        score: Number(user?.score) + 2,
      });
      await updateCommentVoteService(commentId, {
        totalUpvotes: comment.totalUpvotes + 1,
        totalDownvotes: comment.totalDownvotes - 1,
      });
    } else {
      await updateUserScoreService(comment.userId.toString(), {
        score: Number(user?.score) - 2,
      });
      await updateCommentVoteService(commentId, {
        totalUpvotes: comment.totalUpvotes - 1,
        totalDownvotes: comment.totalDownvotes + 1,
      });
    }

    existingVote.vote = vote;
    await existingVote.save();

    const updatedComment = await getIcommentByIdService(commentId);
    return {
      vote,
      upvotes: updatedComment.totalUpvotes,
      downvotes: updatedComment.totalDownvotes,
    };
  }

  if (vote === 0) {
    const updatedComment = await getIcommentByIdService(commentId);
    return {
      vote: 0,
      upvotes: updatedComment.totalUpvotes,
      downvotes: updatedComment.totalDownvotes,
    };
  }

  // First time voting
  const commentVote = await CommentVoteCollection.create({
    commentId,
    ideaId,
    vote,
    userId,
  });

  if (vote === 1) {
    await updateUserScoreService(comment.userId.toString(), {
      score: Number(user?.score) + 1,
    });
    await updateCommentVoteService(commentId, {
      totalUpvotes: comment.totalUpvotes + 1,
    });
  } else {
    await updateUserScoreService(comment.userId.toString(), {
      score: Number(user?.score) - 1,
    });
    await updateCommentVoteService(commentId, {
      totalDownvotes: comment.totalDownvotes + 1,
    });
  }

  const updatedComment = await getIcommentByIdService(commentId);
  return {
    vote,
    upvotes: updatedComment.totalUpvotes,
    downvotes: updatedComment.totalDownvotes,
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
