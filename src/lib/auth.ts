import crypto from "node:crypto"

import { getConfig, saveConfig } from "./config"

export interface ApiKey {
  id: string
  key: string
  name: string
  createdAt: string
}

// Default admin credentials
const DEFAULT_ADMIN_USERNAME = "admin"
const DEFAULT_ADMIN_PASSWORD = "copilot-api-admin"

/**
 * Hash a password using SHA-256 with salt
 */
function hashPassword(password: string, salt: string): string {
  return crypto
    .createHash("sha256")
    .update(salt + password)
    .digest("hex")
}

/**
 * Initialize admin auth if not configured
 */
export async function ensureAdminAuth(): Promise<void> {
  const config = getConfig()
  if (!config.adminAuth) {
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = hashPassword(DEFAULT_ADMIN_PASSWORD, salt)
    await saveConfig({
      ...config,
      adminAuth: {
        username: DEFAULT_ADMIN_USERNAME,
        passwordHash: hash,
        salt,
      },
    })
  }
}

/**
 * Verify admin credentials
 */
export function verifyAdminPassword(
  username: string,
  password: string,
): boolean {
  const config = getConfig()
  const auth = config.adminAuth
  if (!auth) return false
  if (username !== auth.username) return false
  const hash = hashPassword(password, auth.salt)
  return hash === auth.passwordHash
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
  newPassword: string,
): Promise<void> {
  const config = getConfig()
  const auth = config.adminAuth
  if (!auth) return

  const salt = crypto.randomBytes(16).toString("hex")
  const hash = hashPassword(newPassword, salt)
  await saveConfig({
    ...config,
    adminAuth: {
      ...auth,
      passwordHash: hash,
      salt,
    },
  })
}

/**
 * Generate a new API key
 */
export async function generateApiKey(name: string): Promise<ApiKey> {
  const config = getConfig()
  const apiKeys = config.apiKeys ?? []

  const apiKey: ApiKey = {
    id: crypto.randomBytes(8).toString("hex"),
    key: `sk-${crypto.randomBytes(32).toString("hex")}`,
    name,
    createdAt: new Date().toISOString(),
  }

  await saveConfig({
    ...config,
    apiKeys: [...apiKeys, apiKey],
  })

  return apiKey
}

/**
 * Delete an API key by id
 */
export async function deleteApiKey(id: string): Promise<boolean> {
  const config = getConfig()
  const apiKeys = config.apiKeys ?? []
  const filtered = apiKeys.filter((k) => k.id !== id)

  if (filtered.length === apiKeys.length) return false

  await saveConfig({
    ...config,
    apiKeys: filtered,
  })
  return true
}

/**
 * Get all API keys (without the actual key value for listing)
 */
export function listApiKeys(): Array<Omit<ApiKey, "key"> & { keyPreview: string }> {
  const config = getConfig()
  const apiKeys = config.apiKeys ?? []
  return apiKeys.map((k) => ({
    id: k.id,
    name: k.name,
    createdAt: k.createdAt,
    keyPreview: `${k.key.slice(0, 7)}...${k.key.slice(-4)}`,
  }))
}

/**
 * Validate an API key from a request
 * Returns true if:
 * - No API keys are configured (open access)
 * - The provided key matches a configured key
 */
export function validateApiKey(key: string | undefined): boolean {
  const config = getConfig()
  const apiKeys = config.apiKeys ?? []

  // If no API keys configured, allow all requests
  if (apiKeys.length === 0) return true

  if (!key) return false

  return apiKeys.some((k) => k.key === key)
}

// Simple session tokens (in-memory, reset on restart)
const activeSessions = new Map<string, { username: string; expiresAt: number }>()

const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Create a session token for admin
 */
export function createSession(username: string): string {
  const token = crypto.randomBytes(32).toString("hex")
  activeSessions.set(token, {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  })
  return token
}

/**
 * Validate a session token
 */
export function validateSession(token: string | undefined): boolean {
  if (!token) return false
  const session = activeSessions.get(token)
  if (!session) return false
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token)
    return false
  }
  return true
}

/**
 * Destroy a session
 */
export function destroySession(token: string): void {
  activeSessions.delete(token)
}
