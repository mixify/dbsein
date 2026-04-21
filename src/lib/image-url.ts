export function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  // Convert legacy /images/xxx paths to /api/images/xxx
  if (url.startsWith("/images/")) {
    return "/api" + url;
  }
  return url;
}
