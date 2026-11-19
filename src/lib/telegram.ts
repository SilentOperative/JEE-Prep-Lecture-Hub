/**
 * Telegram's official post widget embeds one specific public channel post.
 * A channel URL alone is not a video playlist/API endpoint.
 */
export function telegramEmbedUrl(postUrl: string): string | null {
  try {
    const url = new URL(postUrl);
    if (!["t.me", "www.t.me", "telegram.me", "www.telegram.me"].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/([A-Za-z0-9_]+)\/(\d+)\/?$/);
    if (!match) return null;
    return `https://t.me/${match[1]}/${match[2]}?embed=1`;
  } catch {
    return null;
  }
}

export function isSafeVideoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["t.me", "telegram.me"].includes(url.hostname);
  } catch { return false; }
}