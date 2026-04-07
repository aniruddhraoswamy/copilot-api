import { Hono } from "hono"

import {
  addAccount,
  getAccounts,
  getActiveAccount,
  removeAccount,
  setActiveAccount,
  type Account,
} from "~/lib/accounts"
import {
  changeAdminPassword,
  createSession,
  deleteApiKey,
  destroySession,
  generateApiKey,
  listApiKeys,
  validateSession,
  verifyAdminPassword,
} from "~/lib/auth"
import { getConfig, saveConfig } from "~/lib/config"
import { copilotTokenManager } from "~/lib/copilot-token-manager"
import { forwardError } from "~/lib/error"
import { state } from "~/lib/state"
import { cacheModels } from "~/lib/utils"
import { getCopilotUsage } from "~/services/github/get-copilot-usage"
import { getDeviceCode } from "~/services/github/get-device-code"
import { getGitHubUser } from "~/services/github/get-user"
import { pollAccessTokenOnce } from "~/services/github/poll-access-token"

import { adminHtml, loginHtml } from "./html"
import { adminAuthMiddleware, localOnlyMiddleware } from "./middleware"

export const adminRoutes = new Hono()

// Apply localhost-only middleware to all admin routes
adminRoutes.use("*", localOnlyMiddleware)

// Apply session auth middleware after localhost check
adminRoutes.use("*", adminAuthMiddleware)

// ==================== Auth / Login ====================

// Login page
adminRoutes.get("/login", (c) => {
  return c.html(loginHtml)
})

// Check if user is authenticated
adminRoutes.get("/api/auth/check", (c) => {
  const cookieHeader = c.req.header("cookie") ?? ""
  const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/)
  const token = sessionMatch?.[1]
  return c.json({ authenticated: Boolean(token && validateSession(token)) })
})

// Login
adminRoutes.post("/api/auth/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>()

  if (!body.username || !body.password) {
    return c.json(
      {
        error: {
          message: "Username and password are required",
          type: "validation_error",
        },
      },
      400,
    )
  }

  if (!verifyAdminPassword(body.username, body.password)) {
    return c.json(
      {
        error: {
          message: "Invalid credentials",
          type: "auth_error",
        },
      },
      401,
    )
  }

  const token = createSession(body.username)

  // Set session cookie
  c.header(
    "Set-Cookie",
    `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
  )

  return c.json({ success: true })
})

// Logout
adminRoutes.post("/api/auth/logout", (c) => {
  const cookieHeader = c.req.header("cookie") ?? ""
  const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/)
  const token = sessionMatch?.[1]
  if (token) destroySession(token)

  c.header(
    "Set-Cookie",
    "admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
  )
  return c.json({ success: true })
})

// Change password
adminRoutes.post("/api/auth/change-password", async (c) => {
  const body = await c.req.json<{
    currentPassword: string
    newPassword: string
  }>()

  if (!body.currentPassword || !body.newPassword) {
    return c.json(
      {
        error: {
          message: "Current password and new password are required",
          type: "validation_error",
        },
      },
      400,
    )
  }

  if (body.newPassword.length < 6) {
    return c.json(
      {
        error: {
          message: "New password must be at least 6 characters",
          type: "validation_error",
        },
      },
      400,
    )
  }

  const config = getConfig()
  const auth = config.adminAuth
  if (!auth) {
    return c.json(
      { error: { message: "Admin auth not configured", type: "server_error" } },
      500,
    )
  }

  if (!verifyAdminPassword(auth.username, body.currentPassword)) {
    return c.json(
      {
        error: {
          message: "Current password is incorrect",
          type: "auth_error",
        },
      },
      401,
    )
  }

  await changeAdminPassword(body.newPassword)
  return c.json({ success: true })
})

// ==================== API Keys ====================

// List API keys
adminRoutes.get("/api/api-keys", (c) => {
  return c.json({ apiKeys: listApiKeys() })
})

// Generate new API key
adminRoutes.post("/api/api-keys", async (c) => {
  const body = await c.req.json<{ name: string }>()

  if (!body.name || typeof body.name !== "string") {
    return c.json(
      {
        error: {
          message: "Name is required",
          type: "validation_error",
        },
      },
      400,
    )
  }

  const apiKey = await generateApiKey(body.name.trim())
  return c.json({ success: true, apiKey })
})

// Delete API key
adminRoutes.delete("/api/api-keys/:id", async (c) => {
  const id = c.req.param("id")
  const deleted = await deleteApiKey(id)

  if (!deleted) {
    return c.json(
      { error: { message: "API key not found", type: "not_found" } },
      404,
    )
  }
  return c.json({ success: true })
})

// ==================== Accounts ====================

// Get all accounts
adminRoutes.get("/api/accounts", async (c) => {
  const data = await getAccounts()

  // Return accounts without tokens for security
  const safeAccounts = data.accounts.map((account) => ({
    id: account.id,
    login: account.login,
    avatarUrl: account.avatarUrl,
    accountType: account.accountType,
    createdAt: account.createdAt,
    isActive: account.id === data.activeAccountId,
  }))

  return c.json({
    activeAccountId: data.activeAccountId,
    accounts: safeAccounts,
  })
})

// Get current active account
adminRoutes.get("/api/accounts/active", async (c) => {
  const account = await getActiveAccount()

  if (!account) {
    return c.json({ account: null })
  }

  return c.json({
    account: {
      id: account.id,
      login: account.login,
      avatarUrl: account.avatarUrl,
      accountType: account.accountType,
      createdAt: account.createdAt,
    },
  })
})

// Switch to a different account
adminRoutes.post("/api/accounts/:id/activate", async (c) => {
  const accountId = c.req.param("id")

  const account = await setActiveAccount(accountId)

  if (!account) {
    return c.json(
      {
        error: {
          message: "Account not found",
          type: "not_found",
        },
      },
      404,
    )
  }

  // Update state with new token
  state.githubToken = account.token
  state.accountType = account.accountType

  // Refresh Copilot token with new account
  try {
    copilotTokenManager.clear()
    await copilotTokenManager.getToken()
  } catch {
    return c.json(
      {
        error: {
          message: "Failed to refresh Copilot token after account switch",
          type: "token_error",
        },
      },
      500,
    )
  }

  return c.json({
    success: true,
    account: {
      id: account.id,
      login: account.login,
      avatarUrl: account.avatarUrl,
      accountType: account.accountType,
    },
  })
})

// Delete an account
adminRoutes.delete("/api/accounts/:id", async (c) => {
  const accountId = c.req.param("id")

  const removed = await removeAccount(accountId)

  if (!removed) {
    return c.json(
      {
        error: {
          message: "Account not found",
          type: "not_found",
        },
      },
      404,
    )
  }

  // If we removed the current account, update state
  const activeAccount = await getActiveAccount()
  if (activeAccount) {
    state.githubToken = activeAccount.token
    state.accountType = activeAccount.accountType

    // Refresh Copilot token
    try {
      copilotTokenManager.clear()
      await copilotTokenManager.getToken()
    } catch {
      // Ignore refresh errors on delete
    }
  } else {
    state.githubToken = undefined
    copilotTokenManager.clear()
  }

  return c.json({ success: true })
})

// Initiate device code flow for adding new account
adminRoutes.post("/api/auth/device-code", async (c) => {
  try {
    const response = await getDeviceCode()

    return c.json({
      deviceCode: response.device_code,
      userCode: response.user_code,
      verificationUri: response.verification_uri,
      expiresIn: response.expires_in,
      interval: response.interval,
    })
  } catch {
    return c.json(
      {
        error: {
          message: "Failed to get device code",
          type: "auth_error",
        },
      },
      500,
    )
  }
})

interface PollRequestBody {
  deviceCode: string
  interval: number
  accountType?: string
}

type CreateAccountResult =
  | { success: true; account: Account }
  | { success: false; error: string }

/**
 * Create and save account after successful authorization
 */
/* eslint-disable require-atomic-updates */
async function createAccountFromToken(
  token: string,
  accountType: string,
): Promise<CreateAccountResult> {
  const previousToken = state.githubToken
  state.githubToken = token

  let user
  try {
    user = await getGitHubUser()
  } catch {
    state.githubToken = previousToken
    return { success: false, error: "Failed to get user info" }
  }

  const resolvedAccountType =
    accountType === "business" || accountType === "enterprise" ?
      accountType
    : "individual"

  const account: Account = {
    id: user.id.toString(),
    login: user.login,
    avatarUrl: user.avatar_url,
    token,
    accountType: resolvedAccountType,
    createdAt: new Date().toISOString(),
  }

  await addAccount(account)

  state.githubToken = token
  state.accountType = account.accountType

  try {
    copilotTokenManager.clear()
    await copilotTokenManager.getToken()
  } catch {
    // Continue even if Copilot token fails
  }

  return { success: true, account }
}
/* eslint-enable require-atomic-updates */

// Poll for access token after user authorizes

adminRoutes.post("/api/auth/poll", async (c) => {
  const body = await c.req.json<PollRequestBody>()

  if (!body.deviceCode) {
    return c.json(
      {
        error: { message: "deviceCode is required", type: "validation_error" },
      },
      400,
    )
  }

  const result = await pollAccessTokenOnce(body.deviceCode)

  if (result.status === "pending") {
    return c.json({ pending: true, message: "Waiting for user authorization" })
  }

  if (result.status === "slow_down") {
    return c.json({
      pending: true,
      slowDown: true,
      interval: result.interval,
      message: "Rate limited, please slow down",
    })
  }

  if (result.status === "expired") {
    return c.json(
      {
        error: {
          message: "Device code expired. Please start over.",
          type: "expired",
        },
      },
      400,
    )
  }

  if (result.status === "denied") {
    return c.json(
      {
        error: { message: "Authorization was denied by user.", type: "denied" },
      },
      400,
    )
  }

  if (result.status === "error") {
    return c.json({ error: { message: result.error, type: "auth_error" } }, 500)
  }

  const accountResult = await createAccountFromToken(
    result.token,
    body.accountType ?? "individual",
  )

  if (!accountResult.success) {
    return c.json(
      { error: { message: accountResult.error, type: "auth_error" } },
      500,
    )
  }

  return c.json({
    success: true,
    account: {
      id: accountResult.account.id,
      login: accountResult.account.login,
      avatarUrl: accountResult.account.avatarUrl,
      accountType: accountResult.account.accountType,
    },
  })
})

// Get current auth status
adminRoutes.get("/api/auth/status", async (c) => {
  const activeAccount = await getActiveAccount()

  return c.json({
    authenticated:
      Boolean(state.githubToken) && copilotTokenManager.hasValidToken(),
    hasAccounts: Boolean(activeAccount),
    activeAccount:
      activeAccount ?
        {
          id: activeAccount.id,
          login: activeAccount.login,
          avatarUrl: activeAccount.avatarUrl,
          accountType: activeAccount.accountType,
        }
      : null,
  })
})

// Model Mapping API
adminRoutes.get("/api/model-mappings", (c) => {
  const config = getConfig()
  return c.json({ modelMapping: config.modelMapping ?? {} })
})

adminRoutes.get("/api/settings", (c) => {
  const config = getConfig()
  return c.json({
    rateLimitSeconds: config.rateLimitSeconds ?? null,
    rateLimitWait: config.rateLimitWait ?? false,
    envOverride: {
      rateLimitSeconds: process.env.RATE_LIMIT !== undefined,
      rateLimitWait: process.env.RATE_LIMIT_WAIT !== undefined,
    },
  })
})

adminRoutes.put("/api/settings", async (c) => {
  const body = await c.req.json<{
    rateLimitSeconds?: number | null
    rateLimitWait?: boolean
  }>()

  const rateLimitSeconds =
    body.rateLimitSeconds === null || body.rateLimitSeconds === undefined ?
      undefined
    : body.rateLimitSeconds

  if (
    rateLimitSeconds !== undefined
    && (!Number.isFinite(rateLimitSeconds) || rateLimitSeconds <= 0)
  ) {
    return c.json(
      {
        error: {
          message: '"rateLimitSeconds" must be a number greater than 0',
          type: "validation_error",
        },
      },
      400,
    )
  }

  const rateLimitWait = Boolean(body.rateLimitWait)
  const config = getConfig()
  await saveConfig({
    ...config,
    rateLimitSeconds,
    rateLimitWait,
  })

  state.rateLimitSeconds =
    process.env.RATE_LIMIT === undefined ?
      rateLimitSeconds
    : state.rateLimitSeconds
  state.rateLimitWait =
    process.env.RATE_LIMIT_WAIT === undefined ?
      rateLimitWait
    : state.rateLimitWait

  return c.json({
    success: true,
    settings: {
      rateLimitSeconds: rateLimitSeconds ?? null,
      rateLimitWait,
    },
  })
})

adminRoutes.put("/api/model-mappings/:from", async (c) => {
  const from = c.req.param("from")
  const body = await c.req.json<{ to: string }>()

  if (!body.to || typeof body.to !== "string") {
    return c.json(
      {
        error: { message: '"to" field is required', type: "validation_error" },
      },
      400,
    )
  }

  const config = getConfig()
  const modelMapping = { ...config.modelMapping, [from]: body.to }
  await saveConfig({ ...config, modelMapping })
  return c.json({ success: true, from, to: body.to })
})

adminRoutes.delete("/api/model-mappings/:from", async (c) => {
  const from = c.req.param("from")
  const config = getConfig()

  if (!config.modelMapping || !(from in config.modelMapping)) {
    return c.json(
      { error: { message: "Mapping not found", type: "not_found" } },
      404,
    )
  }

  const { [from]: _removed, ...rest } = config.modelMapping
  await saveConfig({ ...config, modelMapping: rest })
  return c.json({ success: true })
})

// Admin-scoped models endpoint (so dashboard doesn't hit public API)
adminRoutes.get("/api/models", async (c) => {
  try {
    if (!state.models) {
      await cacheModels()
    }
    const models = state.models?.data.map((model) => ({
      id: model.id,
      object: "model",
      type: "model",
      created: 0,
      created_at: new Date(0).toISOString(),
      owned_by: model.vendor,
      display_name: model.name,
    }))
    return c.json({ object: "list", data: models, has_more: false })
  } catch (error) {
    return await forwardError(c, error)
  }
})

// Admin-scoped usage endpoint
adminRoutes.get("/api/usage", async (c) => {
  try {
    const usage = await getCopilotUsage()
    return c.json(usage)
  } catch (error) {
    console.error("Error fetching Copilot usage:", error)
    return c.json({ error: "Failed to fetch Copilot usage" }, 500)
  }
})

// Serve static HTML for admin UI
adminRoutes.get("/", (c) => {
  return c.html(adminHtml)
})
