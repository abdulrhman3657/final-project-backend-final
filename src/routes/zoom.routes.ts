import express, { Request, Response } from "express";
import {
  createMeeting,
  fetchRecordings,
  uploadRecordingsToYoutube,
} from "../controllers/zoom.controller";
import { authorized } from "../middleware/auth.middleware";
import { RequestHandler } from "express";

const router = express.Router();

router.post("/create-meeting", authorized, createMeeting as RequestHandler);
router.get("/recordings", fetchRecordings);
router.get("/upload-recordings", uploadRecordingsToYoutube);

export default router;
