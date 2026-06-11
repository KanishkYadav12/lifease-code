const Groq = require("groq-sdk");
const Conversation = require("../models/Conversation");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// POST /api/chat
const sendMessage = async (req, res, next) => {
  try {
    const { question, sessionId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question cannot be empty" });
    }
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    // Fetch last 6 messages for context
    const recentHistory = await Conversation.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Build Groq chat history format (oldest first)
    const history = recentHistory.reverse().flatMap((conv) => [
      { role: "user", content: conv.question },
      { role: "assistant", content: conv.answer },
    ]);

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful FAQ assistant. Answer questions clearly and concisely. If you do not know the answer, say so honestly.",
          },
          ...history,
          { role: "user", content: question.trim() },
        ],
        temperature: 0.7,
      });
    } catch (error) {
      const status = error?.status || error?.response?.status;
      const isAuthFailure =
        status === 401 ||
        status === 403 ||
        /api key|authentication|unauthor/i.test(error?.message || "");

      if (isAuthFailure) {
        const fallbackAnswer =
          "I can't reach Groq with the configured API key. Replace GROQ_API_KEY in server/.env with a valid Groq key, then restart the server.";

        const conversation = await Conversation.create({
          question: question.trim(),
          answer: fallbackAnswer,
          sessionId,
        });

        return res.status(201).json({
          _id: conversation._id,
          question: conversation.question,
          answer: conversation.answer,
          sessionId: conversation.sessionId,
          createdAt: conversation.createdAt,
        });
      }

      throw error;
    }

    const answer = completion?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return res.status(502).json({ error: "AI returned an empty response" });
    }

    const conversation = await Conversation.create({
      question: question.trim(),
      answer,
      sessionId,
    });

    res.status(201).json({
      _id: conversation._id,
      question: conversation.question,
      answer: conversation.answer,
      sessionId: conversation.sessionId,
      createdAt: conversation.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/conversations?sessionId=xxx
const getConversations = async (req, res, next) => {
  try {
    const { sessionId, page = 1, limit = 50 } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [conversations, total] = await Promise.all([
      Conversation.find({ sessionId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Conversation.countDocuments({ sessionId }),
    ]);

    res.json({
      conversations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/sessions — all unique sessions for sidebar
const getAllSessions = async (req, res, next) => {
  try {
    const sessions = await Conversation.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$sessionId",
          firstQuestion: { $first: "$question" },
          createdAt: { $first: "$createdAt" },
          lastUpdated: { $last: "$updatedAt" },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { lastUpdated: -1 } },
    ]);

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

// GET /api/conversations/search?q=keyword
const searchConversations = async (req, res, next) => {
  try {
    const { q, sessionId } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ error: "Search query cannot be empty" });
    }

    const filter = { $text: { $search: q.trim() } };
    if (sessionId) filter.sessionId = sessionId;

    const conversations = await Conversation.find(filter, {
      score: { $meta: "textScore" },
    })
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .lean();

    res.json({ conversations, query: q.trim() });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/conversations/:sessionId
const clearConversations = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await Conversation.deleteMany({ sessionId });
    res.json({ message: "Conversation history cleared" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getAllSessions,
  searchConversations,
  clearConversations,
};
