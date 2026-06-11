const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    sessionId: {
      type: String,
      required: true,
      index: true, // indexed for faster session-based queries
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

// Text index on question + answer for search functionality
conversationSchema.index({ question: "text", answer: "text" });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
