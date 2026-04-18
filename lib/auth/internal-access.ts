import { getInternalAccessCode, getInternalAccessSecret, isInternalAccessConfigured } from "@/lib/env";

export const INTERNAL_ACCESS_COOKIE_NAME = "nightos_internal_access";

const encoder = new TextEncoder();
const TOKEN_VERSION = "v1";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function secureEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

async function createSignature(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getInternalAccessSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export async function validateInternalAccessCode(input: string) {
  if (!isInternalAccessConfigured()) {
    return false;
  }

  const provided = input.trim();
  const expected = getInternalAccessCode();

  return secureEqual(provided, expected);
}

export async function createInternalAccessCookieValue() {
  if (!isInternalAccessConfigured()) {
    throw new Error("NightOS internal access is not configured.");
  }

  const expiresAt = String(Date.now() + SESSION_DURATION_MS);
  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  const signature = await createSignature(payload);

  return `${payload}.${signature}`;
}

export async function hasValidInternalAccessCookieValue(cookieValue?: string | null) {
  if (!isInternalAccessConfigured()) {
    return true;
  }

  if (!cookieValue) {
    return false;
  }

  const [version, expiresAtRaw, providedSignature] = cookieValue.split(".");
  const expiresAt = Number.parseInt(expiresAtRaw || "", 10);

  if (
    version !== TOKEN_VERSION ||
    !providedSignature ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    return false;
  }

  const payload = `${version}.${expiresAtRaw}`;
  const expectedSignature = await createSignature(payload);

  return secureEqual(providedSignature, expectedSignature);
}

export function getInternalAccessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  };
}
