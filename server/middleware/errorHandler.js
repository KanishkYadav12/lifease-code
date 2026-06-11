const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  const errorText = JSON.stringify(err || {});

  if (
    err.status === 429 ||
    err.code === 429 ||
    err.statusCode === 429 ||
    errorText.includes("RESOURCE_EXHAUSTED") ||
    errorText.includes("quota") ||
    errorText.includes("rate limit")
  ) {
    return res.status(429).json({
      error:
        "AI quota is exhausted for the current free tier project. The server is up, but the configured AI provider cannot serve more requests right now.",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  // Upstream AI API errors
  if (err.status && err.error) {
    return res.status(err.status).json({
      error: err.error.message || "AI service error",
    });
  }

  if (err.message?.toLowerCase().includes("groq")) {
    return res.status(502).json({
      error: err.message,
    });
  }

  // Default 500
  res.status(500).json({
    error: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
