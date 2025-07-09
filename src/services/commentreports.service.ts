import { CommentReportCollection } from "../models/commentReports.model";
import { CommentCollection } from "../models/comments.model";
import { UsersCollection } from "../models/user.model";
import { AppError } from "../utils/error";
import { BAD_REQUEST } from "../utils/http-status";

const REPORT_THRESHOLD = 3;

export const reportCommentService = async (commentId: string, reporterId: string) => {

  const existing = await CommentReportCollection.findOne({ commentId, reporterId});

  if (existing) {
    throw new AppError("already reported this comment", BAD_REQUEST);
  }

  const comment = await CommentCollection.findById(commentId);

  if (!comment) {
    throw new AppError("comment not found", BAD_REQUEST);
  }

  await CommentReportCollection.create({ commentId, reporterId });

  // find the reported
  const user = await UsersCollection.findById(comment.userId);

  if (!user) return null;

  // increment the "reportCount" counter
  const count = Number(user.reportCount || 0) + 1;

  const updates: any = { reportCount: count };

  // automatically block the user
  // if (count >= REPORT_THRESHOLD) {
  //   updates.blocked = true;
  // }

  // update the user data: updates.blocked and user.reportCount
  await UsersCollection.findByIdAndUpdate(user._id, updates, { new: true });

  // return count, updates.blocked
  return { reportCount: count, blocked: count >= REPORT_THRESHOLD };
};

export const getReportedCommentsService = async () => {

  // count: { $sum: 1 } = count how many times the comment has been reported
  // $group collapses every report that shares the same commentId into one output document
  // The count accumulator counts how many collapsed reports, but it doesn’t create extra rows
  // $unwind removes the array wrapper from lookup; it doesn’t replicate data.

  const results = await CommentReportCollection.aggregate([
    { $group: { _id: "$commentId", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "_id",
        as: "comment",
      },
    },
    { $unwind: "$comment" },
  ]);

  return results
};