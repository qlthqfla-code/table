import { randomBytes, createHash } from "crypto";

export const RESET_TOKEN_TTL_MINUTES = 30;

export function generateResetToken() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashResetToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}
