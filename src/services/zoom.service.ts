import axios from "axios";
import generateZoomToken from "../utils/generateZoomToken";

interface CreateMeetingParams {
  userId: string;
  topic?: string;
  duration?: number;
  type?: number;
  start_time?: string;
  isPrivate?: boolean;
}

export const createZoomMeeting = async ({
  userId,
  topic = "Untitled Meeting",
  duration = 30,
  type = 2,
  start_time,
  isPrivate = false,
}: CreateMeetingParams) => {
  const token = await generateZoomToken();

  const payload = {
    topic,
    type,
    duration,
    start_time,
    settings: {
      host_video: true,
      participant_video: true,
      approval_type: 2,
      waiting_room: false,
      join_before_host: true,
      auto_recording: isPrivate ? "none" : "cloud",
    },
  };

  const response = await axios.post(
    `https://api.zoom.us/v2/users/${userId}/meetings`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const getUsersRecordings = async () => {
  const token = await generateZoomToken();
  const userId = process.env.ZOOM_USER_ID;

  const from = "2020-01-01";
  const to = new Date().toISOString().split("T")[0];

  const response = await axios.get(
    `https://api.zoom.us/v2/users/${userId}/recordings`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { from, to, page_size: 50 },
    }
  );

  const meetings = response.data.meetings;
  for (const meeting of meetings) {
    try {
      await makeRecordingPublic(meeting.uuid);
    } catch (err) {
      console.error("Failed to make public:", meeting.uuid, err);
    }
  }

  return meetings;
};

export const makeRecordingPublic = async (meetingUUID: string) => {
  const token = await generateZoomToken();

  const encodedUUID = encodeURIComponent(encodeURIComponent(meetingUUID));

  await axios.patch(
    `https://api.zoom.us/v2/meetings/${encodedUUID}/recordings/settings`,
    {
      share_recording: "publicly",
      password: "",
      on_demand: false,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
