import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

const generateZoomToken = async (): Promise<string> => {
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const accountId = process.env.ZOOM_ACCOUNT_ID;

  if (!clientId || !clientSecret || !accountId) {
    throw new Error("Missing Zoom credentials in environment variables");
  }

  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(tokenUrl, null, {
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    accessToken = response.data.access_token;
    tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000); // Set expiry 1 min before

    return accessToken!;
  } catch (error: any) {
    console.error("Error fetching Zoom token:", error.response?.data || error.message);
    throw new Error("Could not get Zoom access token");
  }
};

export default generateZoomToken;
