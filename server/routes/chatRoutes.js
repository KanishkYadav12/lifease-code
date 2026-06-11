const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getAllSessions,
  searchConversations,
  clearConversations,
} = require("../controllers/chatController");

router.post("/chat", sendMessage);
router.get("/sessions", getAllSessions);
router.get("/conversations/search", searchConversations);
router.get("/conversations", getConversations);
router.delete("/conversations/:sessionId", clearConversations);

module.exports = router;
