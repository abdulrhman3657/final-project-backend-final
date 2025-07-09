import { Schema, model } from "mongoose";

const ventureBoardIdeaSchema = new Schema( 
  {
    ideaId: { type: Schema.Types.ObjectId, required: true, ref: "Idea" },
    datePromoted: {
      type: Date,
      default: Date.now
    },
  },
  { timestamps: true }
);

export const VentureBoardIdeaCollection = model("VentureBoardIdea", ventureBoardIdeaSchema);
