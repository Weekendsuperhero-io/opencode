export * as TrustedRouter from "./trusted-router.js"

declare const OPENCODE_CHANNEL: string

export const enabled = typeof OPENCODE_CHANNEL === "string" && OPENCODE_CHANNEL === "trustedrouter"
export const id = "trustedrouter"
export const model = "trustedrouter/auto"
export const baseURL = "https://api.trustedrouter.com/v1"
export const packageName = "@opencode/ai/providers/openai-compatible"
