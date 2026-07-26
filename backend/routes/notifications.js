import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// Helper mappings for notification colors/bg colors
const typeConfig = {
  success: { color: "text-green-500", bgColor: "bg-green-50" },
  info: { color: "text-blue-500", bgColor: "bg-blue-50" },
  reminder: { color: "text-purple-500", bgColor: "bg-purple-50" },
  alert: { color: "text-orange-500", bgColor: "bg-orange-50" }
};

/**
 * Helper function to create a new notification in the database
 */
export async function createNotification(email, title, message, type = "info") {
  try {
    const config = typeConfig[type] || typeConfig.info;
    const notification = new Notification({
      email,
      title,
      message,
      type,
      color: config.color,
      bgColor: config.bgColor,
      read: false
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
}

/**
 * GET /api/notifications?email=...
 * Fetch user notifications
 */
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const list = await Notification.find({ email }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark notification as read", error: err.message });
  }
});

/**
 * DELETE /api/notifications/all?email=...
 * Clear all notifications for a user
 */
router.delete("/all", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await Notification.deleteMany({ email });
    res.json({ message: "All notifications cleared successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear notifications", error: err.message });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete notification", error: err.message });
  }
});

export default router;
