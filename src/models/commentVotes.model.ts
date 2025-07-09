import { Schema, model } from "mongoose";

// export interface CommentDocument extends Document { 
//   ideaId: Schema.Types.ObjectId;
//   userId: Schema.Types.ObjectId;
//   text: string;
//   votes: Number;
//   voterId: Schema.Types.ObjectId;
// }
// const commentSchema = new Schema<CommentDocument>( 

const commentVoteSchema = new Schema( 
  {
    commentId: { type: Schema.Types.ObjectId, required: true, ref: "Comment" },
    vote: {
      type: Number,
      default: 0
    },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

// Add an upvotes (number) and upvoters (array of userIds) field or a separate CommentVote model

export const CommentVoteCollection = model("CommentVote", commentVoteSchema);
