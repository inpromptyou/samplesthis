// Site-wide feature flags
// Set NEXT_PUBLIC_WAITLIST_MODE=true in Vercel env vars to enable waitlist mode.
// Remove or set to "false" to go back to full launch mode instantly.
export const WAITLIST_MODE = process.env.NEXT_PUBLIC_WAITLIST_MODE === "true";
