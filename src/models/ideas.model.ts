import { Schema, model } from "mongoose";
        

const ideaSchema = new Schema( 
  {
    founderId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    mvpLink: {
      type: String,
    },
    targetMarket: {         
      type: String,
      default: "Not specified",
    },
    totalUpvotes: {
      type: Number,
      default: 0
    },
    totalDownvotes: {
      type: Number,
      default: 0
    },
    isOnVentureBoard: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

export const IdeaCollection = model("Idea", ideaSchema);
