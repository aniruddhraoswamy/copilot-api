import type { Context, Next } from "hono"

import { validateSession } from "~/lib/auth"

/**
 * Middleware to restrict access to localhost only.
 * Admin panel should only be accessible from 127.0.0.1 or ::1
 */
export async function localOnlyMiddleware(
  c: Context,
  next: Next,
): Promise<Response | undefined> {
  // Get client IP from various sources
  const forwardedFor = c.req.header("x-forwarded-for")
  const realIP = c.req.header("x-real-ip")

  // Determine client IP
  let clientIP = forwardedFor?.split(",")[0]?.trim() ?? realIP ?? ""

  // If no forwarded headers, assume direct connection
  // For local development, host header will contain localhost or 127.0.0.1
  if (!clientIP) {
    const hostHeader = c.req.header("host") ?? ""
    if (
      hostHeader.startsWith("localhost")
      || hostHeader.startsWith("127.0.0.1")
      || hostHeader.startsWith("[::1]")
    ) {
      clientIP = "127.0.0.1"
    }
  }

  // Check if the request is from localhost
  const isLocalhost =
    clientIP === "127.0.0.1"
    || clientIP === "::1"
    || clientIP === "::ffff:127.0.0.1"
    || clientIP === "localhost"
    || clientIP === "" // Empty usually means direct local connection

  if (!isLocalhost) {
    return c.json(
      {
        error: {
          message: "Forbidden: Admin panel is only accessible from localhost",
          type: "forbidden",
        },
      },
      403,
    )
  }

  await next()
  return undefined
}

/**
 * Middleware to require admin session for protected routes.
 * Login page and login API are excluded.
 */
export async function adminAuthMiddleware(
  c: Context,
  next: Next,
): Promise<Response | undefined> {
  const path = c.req.path

  // Allow login page, login API, and static assets without session
  if (
    path === "/admin/login"
    || path === "/admin/api/auth/login"
    || path === "/admin/api/auth/check"
  ) {
    await next()
    return undefined
  }

  // Check session cookie or Authorization header
  const cookieHeader = c.req.header("cookie") ?? ""
  const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/)
  const sessionToken = sessionMatch?.[1]

  if (!validateSession(sessionToken)) {
    // For API requests, return 401 JSON
    if (path.startsWith("/admin/api/")) {
      return c.json(
        {
          error: {
            message: "Not authenticated",
            type: "auth_required",
          },
        },
        401,
      )
    }
    // For HTML page requests, redirect to login
    return c.redirect("/admin/login")
  }

  await next()
  return undefined
}
