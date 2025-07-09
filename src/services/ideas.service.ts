import { IdeaCollection } from "../models/ideas.model";
import { AppError } from "../utils/error";
import { BAD_REQUEST } from "../utils/http-status";
import { getVotebyIdService } from "./vote.service";

export const getIdeasService = async () => {

  const ideas = await IdeaCollection.find({}).populate("founderId");

  if (!ideas) {
    throw new AppError("ideas not found", BAD_REQUEST);
  }

  return ideas;
};

export const createtIdeasService = async (
  title: string,
  description: string,
  category: string,
  mvpLink: string,
  founderId: string,
  targetMarket: string,
) => {
  return IdeaCollection.create({
    title,
    description,
    category,
    mvpLink,
    founderId,
    targetMarket
  });
};

export const getIdeaByIdService = async (id: string) => {

  const idea = await IdeaCollection.findOne({ _id: id }).populate(
    "founderId"
  );

  if (!idea) {
    throw new AppError("idea not found", BAD_REQUEST);
  }

  return idea
};

export const updateIdeaByIdService = async (id: string, userId: string, updates: Object) => {

  const idea = await IdeaCollection.findById(id);

  if (!idea) {
    throw new AppError("idea not found", BAD_REQUEST);
  }

  if (idea.founderId.toString() !== userId) {
    throw new AppError("You are not allowed to perform this task", BAD_REQUEST);
  }

  const updatedIdea = await IdeaCollection.findByIdAndUpdate(id, updates, {
    new: true,
  });

  return updatedIdea
};

export const deleteIdeaByIdService = async (id: string, userId: string, role: string) => {

  const idea = await IdeaCollection.findById(id);

  if (!idea) {
    throw new AppError("idea not found", BAD_REQUEST);
  }

  if (idea.founderId.toString() !== userId && role !== "admin") {
    throw new AppError("You are not allowed to perform this task", BAD_REQUEST);
  }

  await IdeaCollection.findByIdAndDelete(id);
  
  return
};

export const makeVentureBoardService = async (id: string) => {
  
  const idea = await IdeaCollection.findByIdAndUpdate(id, {isOnVentureBoard: true}, { new: true });
  
  if (!idea) {
    throw new AppError("idea not found", BAD_REQUEST);
  }

  return
};

export const removeFromVentureBoardService = async (id: string) => {
  const idea = await IdeaCollection.findByIdAndUpdate(
    id,
    { isOnVentureBoard: false },
    { new: true }
  );

  if (!idea) {
    throw new AppError("idea not found", BAD_REQUEST);
  }

  return;
};

export const updateIdeaVotesService = async (id: string, updates: Object) => {

  const idea = await IdeaCollection.findById(id);
  console.log("Vote increments:", updates);  

  if (!idea) {
    throw new AppError("idea not found", BAD_REQUEST);
  }

  const updatedIdea = await IdeaCollection.findByIdAndUpdate(
    id,
    { $inc: updates },
    { new: true }
  );

  return updatedIdea
};

export const getIdeaAnalyticsService = async (id: string) => {

  const idea = getVotebyIdService(id)

  if (!idea) {
    throw new AppError("idea votes not found", BAD_REQUEST);
  }

  return idea
};

export const getVentureBoardIdeasService = async () => {

  const idea = await IdeaCollection.find({ isOnVentureBoard: true }).populate("founderId");

  if (!idea) {
    throw new AppError("idea not found", BAD_REQUEST);
  }

  return idea
};

export const getVentureBoardIdeaByIdService = async (id: string) => {

  const idea = await IdeaCollection.findOne({  _id: id, isOnVentureBoard: true }).populate("founderId")

  if (!idea) {
    throw new AppError("idea not found", BAD_REQUEST);
  }

  return idea
};