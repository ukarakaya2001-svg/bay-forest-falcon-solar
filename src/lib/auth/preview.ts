/**
 * Shared live-preview OAuth configuration.
 *
 * Credentials are intentionally NOT stored in source control. The platform or
 * local developer environment must provide GROK_AUTH_CLIENT_SECRET at runtime.
 * The preview client ID is public metadata; the client secret is not.
 */
export const PREVIEW_CLIENT_ID = "grok_preview";
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
