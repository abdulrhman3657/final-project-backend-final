import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const getSafeFilename = (uuid: string) => {
  return Buffer.from(uuid).toString("base64").replace(/[+/=]/g, "_");
};

export const downloadZoomRecording = async (
  downloadUrl: string,
  uuid: string
): Promise<string> => {
  const safeUUID = getSafeFilename(uuid);
  try {
    const filePath = path.join(__dirname, `../../downloads/${safeUUID}.mp4`);
    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(downloadUrl, {
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filePath));
      writer.on("error", reject);
    });
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
