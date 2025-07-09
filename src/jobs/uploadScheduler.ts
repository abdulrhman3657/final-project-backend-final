import cron from "node-cron";
import { getUsersRecordings } from "../services/zoom.service";
import { uploadVideoToYoutube } from "../services/youtube.service";
import { downloadZoomRecording } from "../utils/downloadZoomRecording";
import { getUploadedUUIDs } from "../utils/uploadedTracker";
import fs from "fs";

export const startZoomToYouTubeScheduler = () => {
  cron.schedule("0 0 1 * *", async () => {
    console.log("Running scheduled upload task...");

    try {
      const recordings = await getUsersRecordings();
      const uploaded = getUploadedUUIDs();

      for (const meeting of recordings) {
        if (uploaded.includes(meeting.uuid)) {
          console.log(`Already uploaded: ${meeting.uuid}`);
          continue;
        }

        const file = meeting.recording_files.find(
          (f: any) => f.file_type === "MP4"
        );
        if (!file) continue;

        const localPath = await downloadZoomRecording(
          file.download_url,
          meeting.uuid
        );
        const uploadResult = await uploadVideoToYoutube(
          localPath,
          meeting.topic,
          "Uploaded from Zoom"
        );

        console.log("Uploaded to YouTube:", uploadResult.id);
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
    } catch (error) {
      console.error(" Upload error:", error);
    }
  });
};
