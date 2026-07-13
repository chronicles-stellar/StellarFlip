/**
 * Player name sanitization utilities.
 *
 * Player-supplied names are stored on-chain and displayed publicly on the
 * leaderboard.  Any user-controlled string rendered in the DOM is a potential
 * XSS vector if it reaches an `innerHTML` / `dangerouslySetInnerHTML` call, or
 * if it is later interpolated into a server-side response.  We therefore strip
 * everything that is not a plain alphanumeric character or space before the
 * value ever leaves the browser.
 */

/** Maximum allowed length for a player display name. */
export const PLAYER_NAME_MAX_LENGTH = 15;

/**
 * Sanitize a raw player name input.
 *
 * Rules (mirrors the on-chain validation in the Soroban contract):
 *  - Strip all characters that are not `[A-Za-z0-9 ]`.  This eliminates HTML
 *    angle brackets, quotes, script keywords, unicode trickery, etc.
 *  - Collapse consecutive whitespace into a single space.
 *  - Trim leading/trailing whitespace.
 *  - Hard-cap to {@link PLAYER_NAME_MAX_LENGTH} characters.
 *
 * The function is intentionally pure and side-effect free so it can be used
 * both during live input (onChange) and at submission time.
 */
export function sanitizePlayerName(raw: string): string {
  return raw
    .replace(/[^A-Za-z0-9 ]/g, "") // strip HTML/JS/special chars
    .replace(/\s+/g, " ") // collapse whitespace
    .trim()
    .slice(0, PLAYER_NAME_MAX_LENGTH);
}

/**
 * Validate a sanitized name and return a human-readable error string, or
 * `null` when the name is acceptable.
 *
 * Call this *after* {@link sanitizePlayerName} if you want to surface a
 * message to the user (e.g. "Name must be at least 1 character").
 */
export function validatePlayerName(name: string): string | null {
  if (name.length === 0) {
    return "Name must be at least 1 character.";
  }

  if (name.length > PLAYER_NAME_MAX_LENGTH) {
    // Should not happen after sanitizePlayerName, but guard defensively.
    return `Name must be ${PLAYER_NAME_MAX_LENGTH} characters or fewer.`;
  }

  // Re-check the allowed pattern as a belt-and-suspenders guard.
  if (!/^[A-Za-z0-9 ]+$/.test(name)) {
    return "Name may only contain letters, numbers, and spaces.";
  }

  return null;
}
