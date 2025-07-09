import { Schema, model } from "mongoose";

const voteSchema = new Schema( 
  {
    ideaId: { type: Schema.Types.ObjectId, required: true, ref: "Idea" },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    value: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const VoteCollection = model("Vote", voteSchema);
