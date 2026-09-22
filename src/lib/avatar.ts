import { createAvatar } from "@dicebear/core";
import * as personas from "@dicebear/personas";

const cache = new Map<string, string>();

/**
 * Deterministically generates a professional-looking illustrated avatar for
 * a given seed (typically a user's id) entirely client-side - no network
 * request, no uploaded photo. The same seed always produces the same
 * avatar, so each person in the directory has a stable "profile picture".
 */
export function getAvatarUri(seed: string, backgroundColor?: string): string {
  const cacheKey = `${seed}:${backgroundColor ?? ""}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const avatar = createAvatar(personas, {
    seed,
    size: 128,
    backgroundColor: backgroundColor ? [backgroundColor.replace("#", "")] : undefined,
    backgroundType: ["solid"],
  });

  const uri = avatar.toDataUri();
  cache.set(cacheKey, uri);
  return uri;
}
