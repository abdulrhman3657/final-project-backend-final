import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

const YT_CLIENT_ID = process.env.YT_CLIENT_ID!;
const YT_CLIENT_SECRET = process.env.YT_CLIENT_SECRET!;
const YT_REFRESH_TOKEN = process.env.YT_REFRESH_TOKEN!;
const YT_REDIRECT_URI = process.env.YT_REDIRECT_URI!;

export const getYoutubeAccessToken = async () => {
  const response = await axios.post(
    "https://oauth2.googleapis.com/token",
    null,
    {
      params: {
        client_id: YT_CLIENT_ID,
        client_secret: YT_CLIENT_SECRET,
        refresh_token: YT_REFRESH_TOKEN,
        grant_type: "refresh_token",
      },
    }
  );

  return response.data.access_token;
};

export const uploadVideoToYoutube = async (
  filePath: string,
  title: string,
  description: string
) => {
  const accessToken = await getYoutubeAccessToken();

  const fileStream = fs.createReadStream(filePath);

  const metadata = {
    snippet: {
      title,
      description,
    },
    status: {
      privacyStatus: "public",
    },
  };

  const form = new FormData();
  
  form.append("snippet", JSON.stringify(metadata), {
    contentType: "application/json; charset=UTF-8",
  });
  
  form.append("media", fileStream, {
    contentType: "video/*",
    filename: path.basename(filePath),
  });

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...form.getHeaders(),
  };

  try {
    const response = await axios.post(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
      form,
      { 
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("YouTube upload error:", error.response?.data);
      throw new Error(`YouTube upload failed: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
};

export const uploadVideoToYoutubeResumable = async (
  filePath: string,
  title: string,
  description: string
) => {
  const accessToken = await getYoutubeAccessToken();

  const metadata = {
    snippet: {
      title,
      description,
    },
    status: {
      privacyStatus: "unlisted",
    },
  };

  try {
    const initResponse = await axios.post(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      metadata,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": "video/*",
          "X-Upload-Content-Length": fs.statSync(filePath).size.toString(),
        },
      }
    );

    const uploadUrl = initResponse.headers.location;

    const fileStream = fs.createReadStream(filePath);
    const uploadResponse = await axios.put(uploadUrl, fileStream, {
      headers: {
        "Content-Type": "video/*",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return uploadResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("YouTube resumable upload error:", error.response?.data);
      throw new Error(`YouTube upload failed: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
};