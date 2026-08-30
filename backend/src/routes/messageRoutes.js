import { Router } from "express";
import {
  myConversations,
  unreadCount,
  startConversation,
  startConversationRules,
  getMessages,
  sendMessage,
  messageRules,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/conversations", protect, myConversations);
router.get("/unread-count", protect, unreadCount);
router.post("/conversations", protect, startConversationRules, startConversation);
router.get("/conversations/:id", protect, getMessages);
router.post("/conversations/:id", protect, messageRules, sendMessage);

export default router;
