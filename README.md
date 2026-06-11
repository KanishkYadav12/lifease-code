## FAQ Assistant — Local Dev

This repository contains a Next.js frontend (`client/`) and an Express API (`server/`) that demonstrates a small FAQ assistant using Groq's models.

Prerequisites

- Node.js (16+), npm
- MongoDB Atlas (or local MongoDB) for `MONGO_URI`
- Groq API key for `GROQ_API_KEY`

Quick start (server)

1. Copy `server/.env.example` to `server/.env` and fill in the values. Do NOT commit `server/.env`.

2. From the `server/` folder:

```bash
npm install
npm run dev
```

Quick start (client)

From the `client/` folder:

```bash
npm install
npm run dev
```

Notes & deliverables

- The server expects `GROQ_API_KEY` and will use the model set in `GROQ_MODEL` (default `llama-3.3-70b-versatile`).
- `server/.env` is ignored by git; make sure to use `server/.env.example` as a template.
- For security, remove any real API keys before sharing the repo. I sanitized the example `.env` in the workspace — replace placeholders locally.

Recommended next steps

- Add demo screenshots or a short video to the `docs/` folder for your deliverable.
- Create a GitHub repo and push without `server/.env`. Add CI or simple tests for the API.

If you want, I can add a `Dockerfile` + `docker-compose.yml`, implement streaming responses, or add basic tests next.
