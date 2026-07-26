import express from "express";
import MoodLog from "../models/MoodLog.js";
import { createNotification } from "./notifications.js";

const router = express.Router();

const moodEmojis = [
  { emoji: "😊", label: "Happy", color: "bg-[#F5EFE7]", value: 5 },
  { emoji: "😌", label: "Calm", color: "bg-[#D4F1E8]", value: 4 },
  { emoji: "😐", label: "Neutral", color: "bg-[#FFF4D6]", value: 3 },
  { emoji: "😰", label: "Sad", color: "bg-[#FFE5E5]", value: 2 },
  { emoji: "😫", label: "Stressed", color: "bg-[#D4F1F0]", value: 1 },
];

/**
 * POST /api/mood/log
 * Save daily mood log entry
 */
router.post("/log", async (req, res) => {
  try {
    const { email, mood, label, note, date, time } = req.body;

    if (!email || !mood || !label || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save new mood entry
    const entry = new MoodLog({
      email,
      mood,
      label,
      note: note || "",
      date,
      time
    });

    await entry.save();

    // Trigger Notification
    await createNotification(
      email,
      "Mood Recorded",
      `Your mood has been logged as "${label}" successfully.`,
      "success"
    );

    res.json({ message: "Mood saved successfully", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to log mood", error: err.message });
  }
});

/**
 * GET /api/mood/history?email=...
 * Get mood history logs for a user
 */
router.get("/history", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const history = await MoodLog.find({ email }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch mood history", error: err.message });
  }
});

/**
 * GET /api/mood/stats?email=...
 * Fetch calculated mood statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const logs = await MoodLog.find({ email }).sort({ createdAt: -1 });

    // 1. Mood Frequency & Emotional Distribution
    const frequencies = { Happy: 0, Calm: 0, Neutral: 0, Sad: 0, Stressed: 0 };
    let totalLogs = logs.length;

    logs.forEach(log => {
      if (frequencies[log.label] !== undefined) {
        frequencies[log.label]++;
      }
    });

    const distribution = Object.keys(frequencies).map(label => {
      const count = frequencies[label];
      const percentage = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
      const emojiMatch = moodEmojis.find(e => e.label === label);
      return {
        label,
        emoji: emojiMatch ? emojiMatch.emoji : "😐",
        color: emojiMatch ? emojiMatch.color : "bg-gray-100",
        count,
        percentage
      };
    });

    // 2. Weekly Overview (Mon-Sun logs mapping for the current/latest week)
    // Find logs from the last 7 days or map days of the week based on current calendar
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyOverview = weekdays.map(day => {
      return { day, emoji: "", height: "h-0", color: "bg-gray-200" };
    });

    // Proportional heights depending on emotional value
    const heights = {
      Happy: "h-44", // 100%
      Calm: "h-36", // 80%
      Neutral: "h-28", // 60% (higher than sad, lower than happy)
      Sad: "h-20", // 45%
      Stressed: "h-14" // 30%
    };

    const colors = {
      Happy: "bg-[#C1E8C8]",
      Calm: "bg-[#D5C9F5]",
      Neutral: "bg-[#FFF4D6]",
      Sad: "bg-[#FFB3C1]",
      Stressed: "bg-[#D4F1F0]"
    };

    // Grab latest logs in the past week to plot
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentLogs = await MoodLog.find({
      email,
      createdAt: { $gte: oneWeekAgo }
    }).sort({ createdAt: 1 });

    recentLogs.forEach(log => {
      const logDay = new Date(log.createdAt).getDay(); // 0 is Sun, 1 is Mon, etc.
      const adjustedIndex = logDay === 0 ? 6 : logDay - 1; // Map Mon=0, Sun=6
      weeklyOverview[adjustedIndex] = {
        day: weekdays[adjustedIndex],
        emoji: log.mood,
        height: heights[log.label] || "h-0",
        color: colors[log.label] || "bg-gray-200"
      };
    });

    // 3. Wellness Score (Average value of moods logged)
    let wellnessScoreSum = 0;
    logs.forEach(log => {
      const emojiMatch = moodEmojis.find(e => e.label === log.label);
      if (emojiMatch) {
        wellnessScoreSum += emojiMatch.value; // scale 1-5
      }
    });
    const avgWellnessScore = totalLogs > 0 ? Math.round((wellnessScoreSum / (totalLogs * 5)) * 100) : 0;

    // 4. Streak Calculation
    let currentStreak = 0;
    if (logs.length > 0) {
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      // Check if logged today or yesterday
      let hasLoggedRecently = false;
      const latestLogDate = new Date(logs[0].createdAt);
      latestLogDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((checkDate.getTime() - latestLogDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        hasLoggedRecently = true;
        // Count consecutive days
        let lastLoggedDay = latestLogDate;
        currentStreak = 1;

        for (let i = 1; i < logs.length; i++) {
          const logDate = new Date(logs[i].createdAt);
          logDate.setHours(0, 0, 0, 0);
          const gap = Math.round((lastLoggedDay.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
          if (gap === 1) {
            currentStreak++;
            lastLoggedDay = logDate;
          } else if (gap > 1) {
            break; // Streak broken
          }
        }
      }
    }

    res.json({
      totalLogs,
      wellnessScore: avgWellnessScore,
      streak: currentStreak,
      frequencies,
      distribution,
      weeklyOverview
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate mood stats", error: err.message });
  }
});

export default router;
