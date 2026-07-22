const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow your frontend to communicate with this backend
app.use(cors());

// Your YouTube Channel ID
const CHANNEL_ID = "UCUeOot74J0WL2B3cVvKhqjA";

// Test route
app.get("/", (req, res) => {
  res.send("Iksha's Cooking Corner backend is running!");
});

// Get latest YouTube videos
app.get("/api/videos", async (req, res) => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "YouTube API key is not configured."
      });
    }

    // Get channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    const channelData = await channelResponse.json();

    if (!channelResponse.ok || !channelData.items?.length) {
      return res.status(500).json({
        error: "Unable to find the YouTube channel."
      });
    }

    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Get latest uploaded videos
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=24&playlistId=${uploadsPlaylistId}&key=${API_KEY}`
    );

    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      return res.status(500).json({
        error: "Unable to fetch YouTube videos.",
        details: videosData
      });
    }

    // Send only the required data to the frontend
    const videos = videosData.items.map(video => ({
      videoId: video.snippet.resourceId.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail:
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.medium?.url ||
        video.snippet.thumbnails.default?.url,
      publishedAt: video.snippet.publishedAt
    }));

    res.json(videos);

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Something went wrong while fetching YouTube videos."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});