/**
 * High-Security Admin Authentication & Password Vault for GAZU
 * 
 * Features:
 * - SHA-256 cryptographic hashing via native Web Crypto API (SubtleCrypto)
 * - Protected sessionStorage token with auto-expiry
 * - Brute-force rate limiting (locks out after 5 consecutive failed attempts)
 * - Master password change capability
 */

const AUTH_HASH_STORAGE_KEY = 'gazu_admin_pass_hash_v1';
const SESSION_TOKEN_KEY = 'gazu_admin_active_session_v1';
const RATE_LIMIT_KEY = 'gazu_admin_rate_limit_v1';

// Default Master Password: Gazu@SuperSecret#2026!
const DEFAULT_MASTER_HASH =
  'ef1336f9c5c94402575fdd2fb8317b0bc4c04d821df11c4b07df093396459555';

export const DEFAULT_ADMIN_PASSWORD = 'Gazu@SuperSecret#2026!';

/**
 * Computes SHA-256 hash of a string using native Web Crypto API
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retrieves the stored password hash (or default master hash)
 */
// In-memory fallback for environments without localStorage (e.g. Node.js unit tests / SSR)
const memoryStore = new Map<string, string>();

function safeGetItem(key: string, isSession = false): string | null {
  try {
    if (isSession) {
      if (typeof sessionStorage !== 'undefined') return sessionStorage.getItem(key);
    } else {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return memoryStore.get(key) || null;
}

function safeSetItem(key: string, value: string, isSession = false): void {
  try {
    if (isSession) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value);
        return;
      }
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
    }
  } catch {
    // fallback
  }
  memoryStore.set(key, value);
}

function safeRemoveItem(key: string, isSession = false): void {
  try {
    if (isSession) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
        return;
      }
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
    }
  } catch {
    // fallback
  }
  memoryStore.delete(key);
}

export function getStoredPasswordHash(): string {
  const stored = safeGetItem(AUTH_HASH_STORAGE_KEY);
  return stored || DEFAULT_MASTER_HASH;
}

export async function updateAdminMasterPassword(newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  const hash = await sha256(newPassword);
  safeSetItem(AUTH_HASH_STORAGE_KEY, hash);
}

export function isAdminAuthenticated(): boolean {
  try {
    const session = safeGetItem(SESSION_TOKEN_KEY, true);
    if (!session) return false;
    const { token, expiresAt } = JSON.parse(session);
    if (Date.now() > expiresAt) {
      safeRemoveItem(SESSION_TOKEN_KEY, true);
      return false;
    }
    return Boolean(token);
  } catch {
    return false;
  }
}

export function getRateLimitStatus(): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  try {
    const raw = safeGetItem(RATE_LIMIT_KEY);
    if (!raw) return { isLocked: false, remainingSeconds: 0, attempts: 0 };
    const { attempts, lockedUntil } = JSON.parse(raw);
    const now = Date.now();
    if (lockedUntil && now < lockedUntil) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((lockedUntil - now) / 1000),
        attempts,
      };
    }
    if (lockedUntil && now >= lockedUntil) {
      safeRemoveItem(RATE_LIMIT_KEY);
      return { isLocked: false, remainingSeconds: 0, attempts: 0 };
    }
    return { isLocked: false, remainingSeconds: 0, attempts: attempts || 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }
}

function recordFailedAttempt(): void {
  const current = getRateLimitStatus();
  const nextAttempts = current.attempts + 1;
  const lockTime = nextAttempts >= 5 ? Date.now() + 30 * 1000 : null; // 30s lockout after 5 fails

  safeSetItem(
    RATE_LIMIT_KEY,
    JSON.stringify({
      attempts: nextAttempts,
      lockedUntil: lockTime,
    })
  );
}

function clearRateLimit(): void {
  safeRemoveItem(RATE_LIMIT_KEY);
}

/**
 * Validates password and starts authenticated session
 */
export async function authenticateAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const rateLimit = getRateLimitStatus();
  if (rateLimit.isLocked) {
    return {
      success: false,
      error: `Security Lockout: Too many failed attempts. Please wait ${rateLimit.remainingSeconds} seconds.`,
    };
  }

  const inputHash = await sha256(password);
  const targetHash = getStoredPasswordHash();

  if (inputHash === targetHash) {
    clearRateLimit();
    // 4 hours session validity
    const sessionPayload = {
      token: `gazu_sec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      expiresAt: Date.now() + 4 * 60 * 60 * 1000,
    };
    safeSetItem(SESSION_TOKEN_KEY, JSON.stringify(sessionPayload), true);
    return { success: true };
  }

  recordFailedAttempt();
  const updatedLimit = getRateLimitStatus();
  if (updatedLimit.isLocked) {
    return {
      success: false,
      error: 'Security Lockout triggered: Maximum attempts exceeded. Locked for 30 seconds.',
    };
  }

  return {
    success: false,
    error: `Incorrect master password. (${5 - updatedLimit.attempts} attempt(s) remaining)`,
  };
}

export function logoutAdmin(): void {
  safeRemoveItem(SESSION_TOKEN_KEY, true);
}
