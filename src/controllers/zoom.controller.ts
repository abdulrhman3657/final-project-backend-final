import { Request, Response } from "express";
import {
  createZoomMeeting,
  getUsersRecordings,
} from "../services/zoom.service";
import { handleMeetingEmails } from "../services/email.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { IdeaCollection } from "../models/ideas.model";
import { CommentCollection } from "../models/comments.model";
import { downloadZoomRecording } from "../utils/downloadZoomRecording";
import { uploadVideoToYoutube } from "../services/youtube.service";
import fs from "fs";

export const createMeeting = async (req: AuthRequest, res: Response) => {
  const { topic, duration, start_time, targetType, targetId, isPrivate } =
    req.body;

  const sender_email = req.user.email;
  const sender_role = req.user.role;
  const sender_name = req.user.name;

  try {
    let recipient_email = "";

    if (targetType === "idea") {
      const idea =
        await IdeaCollection.findById(targetId).populate("founderId");

      if (!idea || !(idea as any).founderId?.email) {
        res.status(404).json({ error: "Idea owner not found" });
        return;
      }
      recipient_email = (idea as any).founderId.email;
    } else if (targetType === "comment") {
      const comment =
        await CommentCollection.findById(targetId).populate("userId");
      if (!comment || !(comment as any).userId?.email) {
        res.status(404).json({ error: "Comment author not found" });
        return;
      }
      recipient_email = (comment as any).userId.email;
    }
    if (!sender_email || !sender_role || !recipient_email) {
      res.status(400).json({ error: "Missing sender or recipient info" });
      return;
    }

    const meetingData = await createZoomMeeting({
      userId: "me",
      topic,
      duration,
      start_time,
      isPrivate,
    });

    await handleMeetingEmails({
      sender_role,
      sender_name,
      sender_email,
      recipient_email,
      topic,
      join_url: meetingData.join_url,
      start_time,
      duration,
    });

    res.status(201).json({
      message: "Meeting created and emails sent",
      meeting: meetingData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create meeting or send email" });
  }
};

export const fetchRecordings = async (req: Request, res: Response) => {
  try {
    const recordings = await getUsersRecordings();
    res.json(recordings);
  } catch (error) {
    console.error("Failed to get recordings", error);
    res.status(500).json({ error: "Failed to get recordings" });
  }
};


export const uploadRecordingsToYoutube = async (req: Request, res: Response) => {
  try {
    const recordings = await getUsersRecordings();
    const uploadedIds: string[] = [];

    for (const meeting of recordings) {
      const file = meeting.recording_files.find(
        (f: any) => f.file_type === "MP4"
      );

      if (file) {
        const localPath = await downloadZoomRecording(
          file.download_url,
          meeting.uuid
        );

        const uploadResult = await uploadVideoToYoutube(
          localPath,
          meeting.topic,
          "Uploaded from Zoom"
        );

        uploadedIds.push(uploadResult.id);

        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
    }

    res.json({ message: "Uploaded successfully", uploadedIds });
  } catch (error) {
    console.error("Upload to YouTube failed", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

