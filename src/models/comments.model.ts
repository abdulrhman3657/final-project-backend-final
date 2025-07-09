import { Schema, model } from "mongoose";

// export interface CommentDocument extends Document { 
//   ideaId: Schema.Types.ObjectId;
//   userId: Schema.Types.ObjectId;
//   text: string;
//   votes: Number;
//   voterId: Schema.Types.ObjectId;
// }
// const commentSchema = new Schema<CommentDocument>( 

const commentSchema = new Schema( 
  {
    ideaId: { type: Schema.Types.ObjectId, required: true, ref: "Idea" },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    text: {
      type: String,
      required: true,
    },
    totalUpvotes: {
      type: Number,
      default: 0
    },
    totalDownvotes: {
      type: Number,
      default: 0
    },
    voterId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Add an upvotes (number) and upvoters (array of userIds) field or a separate CommentVote model

export const CommentCollection = model("Comment", commentSchema);
