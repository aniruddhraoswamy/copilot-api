import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import { validateApiKey, validateSession } from "./lib/auth"
import { adminRoutes } from "./routes/admin/route"
import { completionRoutes } from "./routes/chat-completions/route"
import { embeddingRoutes } from "./routes/embeddings/route"
import { messageRoutes } from "./routes/messages/route"
import { modelRoutes } from "./routes/models/route"
import { responsesRoutes } from "./routes/responses/route"
import { tokenRoute } from "./routes/token/route"
import { usageRoute } from "./routes/usage/route"

export const server = new Hono()

server.use(logger())
server.use(cors())

// API key authentication middleware for API endpoints
const apiKeyAuth: Parameters<typeof server.use>[1] = async (c, next) => {
  // Allow admin session to bypass API key check (for admin panel model/usage fetches)
  const cookieHeader = c.req.header("cookie") ?? ""
  const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/)
  if (sessionMatch?.[1] && validateSession(sessionMatch[1])) {
    await next()
    return
  }

  const authHeader = c.req.header("authorization")
  const key = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader

  if (!validateApiKey(key)) {
    return c.json(
      {
        error: {
          message: "Invalid or missing API key",
          type: "authentication_error",
        },
      },
      401,
    )
  }
  await next()
}

server.get("/", (c) => c.text("Server running"))

// Apply API key auth to all API endpoints
server.use("/chat/completions/*", apiKeyAuth)
server.use("/models/*", apiKeyAuth)
server.use("/embeddings/*", apiKeyAuth)
server.use("/responses/*", apiKeyAuth)
server.use("/v1/*", apiKeyAuth)

server.route("/chat/completions", completionRoutes)
server.route("/models", modelRoutes)
server.route("/embeddings", embeddingRoutes)
server.route("/usage", usageRoute)
server.route("/token", tokenRoute)
server.route("/responses", responsesRoutes)

// Compatibility with tools that expect v1/ prefix
server.route("/v1/chat/completions", completionRoutes)
server.route("/v1/models", modelRoutes)
server.route("/v1/embeddings", embeddingRoutes)
server.route("/v1/responses", responsesRoutes)

// Anthropic compatible endpoints
server.route("/v1/messages", messageRoutes)

// Admin panel (localhost only)
server.route("/admin", adminRoutes)
