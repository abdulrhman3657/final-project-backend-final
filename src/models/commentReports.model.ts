import { Schema, model } from "mongoose";

const commentReportSchema = new Schema(
  {
    commentId: { type: Schema.Types.ObjectId, required: true, ref: "Comment" }, // get the reported user from the comment id
    reporterId: { type: Schema.Types.ObjectId, required: true, ref: "User" }, // track the reporter id
  },
  { timestamps: true },
);

export const CommentReportCollection = model("CommentReport", commentReportSchema);