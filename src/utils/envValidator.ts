/**
 * Environment Validation & Ephemeral Session Configuration Utility
 *
 * Checks for the existence of:
 * - VITE_CLOUDINARY_CLOUD_NAME
 * - VITE_CLOUDINARY_UPLOAD_PRESET
 * - TURSO_DATABASE_URL
 * - TURSO_AUTH_TOKEN
 *
 * Supports:
 * 1. Build/runtime environment variables (`import.meta.env` & `process.env`)
 * 2. Ephemeral session-only overrides (`sessionStorage` - cleared when tab closes)
 * 3. Persisted browser configuration fallback (`localStorage`)
 */

export const REQUIRED_ENV_KEYS = [
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET',
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
] as const;

export type EnvKey = (typeof REQUIRED_ENV_KEYS)[number];

export type EnvSourceType = 'env' | 'session' | 'local' | 'missing';

export interface EnvVariableStatus {
  key: EnvKey;
  label: string;
  description: string;
  isSecret: boolean;
  placeholder: string;
  present: boolean;
  source: EnvSourceType;
  value: string;
}

export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: EnvKey[];
  presentKeys: EnvKey[];
  statuses: EnvVariableStatus[];
  values: Record<EnvKey, string>;
  dotEnvSnippet: string;
}

export interface EnvResolutionSources {
  metaEnv?: Record<string, string | undefined>;
  processEnv?: Record<string, string | undefined>;
  sessionEnv?: Partial<Record<EnvKey, string>>;
  localEnv?: Partial<Record<EnvKey, string>>;
}

const EPHEMERAL_SESSION_STORAGE_KEY = 'gazu_ephemeral_env_v1';
const DISMISSED_SESSION_KEY = 'gazu_env_prompt_dismissed_v1';

// In-memory fallback for Node.js unit test environments where sessionStorage is undefined
const memorySessionStore = new Map<string, string>();

function getSessionItem(key: string): string | null {
  if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return memorySessionStore.get(key) ?? null;
}

function setSessionItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
    try {
      window.sessionStorage.setItem(key, value);
      return;
    } catch {
      // ignore storage quota errors
    }
  }
  memorySessionStore.set(key, value);
}

function removeSessionItem(key: string): void {
  if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
    try {
      window.sessionStorage.removeItem(key);
      return;
    } catch {
      // ignore
    }
  }
  memorySessionStore.delete(key);
}

export const ENV_METADATA: Record<
  EnvKey,
  {
    label: string;
    description: string;
    isSecret: boolean;
    placeholder: string;
  }
> = {
  VITE_CLOUDINARY_CLOUD_NAME: {
    label: 'Cloudinary Cloud Name',
    description: 'Used for dynamic WebP resizing and unsigned media delivery.',
    isSecret: false,
    placeholder: 'e.g. dxyz12345',
  },
  VITE_CLOUDINARY_UPLOAD_PRESET: {
    label: 'Cloudinary Unsigned Upload Preset',
    description: 'Unsigned preset name for client-side <100KB WebP uploads without API secrets.',
    isSecret: false,
    placeholder: 'e.g. gazu_unsigned_preset',
  },
  TURSO_DATABASE_URL: {
    label: 'Turso Database URL',
    description: 'libSQL edge database URL for products, categories, and customer orders.',
    isSecret: false,
    placeholder: 'libsql://your-db-name-org.turso.io',
  },
  TURSO_AUTH_TOKEN: {
    label: 'Turso Auth Token',
    description: 'Database authentication token for read/write libSQL operations.',
    isSecret: true,
    placeholder: 'eyJhbGciOiJFZERTQSI...',
  },
};

/**
 * Reads ephemeral environment overrides stored in `sessionStorage` for the current tab session.
 */
export function getEphemeralEnv(): Partial<Record<EnvKey, string>> {
  const raw = getSessionItem(EPHEMERAL_SESSION_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Saves environment variables ephemerally in `sessionStorage` for the current session only.
 */
export function saveEphemeralEnv(values: Partial<Record<EnvKey, string>>): void {
  const current = getEphemeralEnv();
  const merged: Partial<Record<EnvKey, string>> = { ...current };

  for (const key of REQUIRED_ENV_KEYS) {
    if (values[key] !== undefined) {
      const trimmed = values[key]!.trim();
      if (trimmed) {
        merged[key] = trimmed;
      } else {
        delete merged[key];
      }
    }
  }

  setSessionItem(EPHEMERAL_SESSION_STORAGE_KEY, JSON.stringify(merged));
}

/**
 * Clears all ephemeral environment variables from the current session.
 */
export function clearEphemeralEnv(): void {
  removeSessionItem(EPHEMERAL_SESSION_STORAGE_KEY);
}

/**
 * Checks whether the user has dismissed the environment prompt for the current session.
 */
export function isEnvPromptDismissed(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return true;
    }
  }
  return getSessionItem(DISMISSED_SESSION_KEY) === 'true';
}

/**
 * Marks the environment setup prompt as dismissed for the current session.
 */
export function dismissEnvPromptForSession(): void {
  setSessionItem(DISMISSED_SESSION_KEY, 'true');
}

/**
 * Reads any persisted local configurations from `localStorage` (set via Admin Panel).
 */
export function getPersistedLocalEnv(): Partial<Record<EnvKey, string>> {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return {};
  }
  const result: Partial<Record<EnvKey, string>> = {};
  try {
    const rawCloud = window.localStorage.getItem('gazu_cloudinary_config');
    if (rawCloud) {
      const parsed = JSON.parse(rawCloud);
      if (parsed?.cloudName?.trim()) result.VITE_CLOUDINARY_CLOUD_NAME = parsed.cloudName.trim();
      if (parsed?.uploadPreset?.trim()) result.VITE_CLOUDINARY_UPLOAD_PRESET = parsed.uploadPreset.trim();
    }
  } catch {
    // ignore
  }

  try {
    const rawTurso = window.localStorage.getItem('gazu_turso_config');
    if (rawTurso) {
      const parsed = JSON.parse(rawTurso);
      if (parsed?.url?.trim()) result.TURSO_DATABASE_URL = parsed.url.trim();
      if (parsed?.authToken?.trim()) result.TURSO_AUTH_TOKEN = parsed.authToken.trim();
    }
  } catch {
    // ignore
  }

  return result;
}

/**
 * Reads raw build/runtime `.env` variables from `import.meta.env` and `process.env`.
 */
function readRuntimeEnv(
  customMetaEnv?: Record<string, string | undefined>,
  customProcessEnv?: Record<string, string | undefined>
): Partial<Record<EnvKey, string>> {
  const metaEnv: Record<string, string | undefined> =
    customMetaEnv ??
    ((typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string | undefined> }).env) ||
      {});

  const procEnv: Record<string, string | undefined> =
    customProcessEnv ??
    ((typeof process !== 'undefined' && (process.env as Record<string, string | undefined>)) || {});

  const pick = (...candidates: Array<string | undefined>): string => {
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim().length > 0) {
        return c.trim();
      }
    }
    return '';
  };

  return {
    VITE_CLOUDINARY_CLOUD_NAME: pick(
      metaEnv.VITE_CLOUDINARY_CLOUD_NAME,
      procEnv.VITE_CLOUDINARY_CLOUD_NAME
    ),
    VITE_CLOUDINARY_UPLOAD_PRESET: pick(
      metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET,
      procEnv.VITE_CLOUDINARY_UPLOAD_PRESET
    ),
    TURSO_DATABASE_URL: pick(
      metaEnv.TURSO_DATABASE_URL,
      metaEnv.VITE_TURSO_DATABASE_URL,
      procEnv.TURSO_DATABASE_URL,
      procEnv.VITE_TURSO_DATABASE_URL
    ),
    TURSO_AUTH_TOKEN: pick(
      metaEnv.TURSO_AUTH_TOKEN,
      metaEnv.VITE_TURSO_AUTH_TOKEN,
      procEnv.TURSO_AUTH_TOKEN,
      procEnv.VITE_TURSO_AUTH_TOKEN
    ),
  };
}

/**
 * Validates the presence of all required Cloudinary and Turso environment variables
 * across `.env`, ephemeral `sessionStorage`, and persisted `localStorage`.
 */
export function validateEnvironment(customSources?: EnvResolutionSources): EnvValidationResult {
  const runtimeEnv = readRuntimeEnv(customSources?.metaEnv, customSources?.processEnv);
  const sessionEnv = customSources?.sessionEnv ?? getEphemeralEnv();
  const localEnv = customSources?.localEnv ?? getPersistedLocalEnv();

  const statuses: EnvVariableStatus[] = [];
  const missingKeys: EnvKey[] = [];
  const presentKeys: EnvKey[] = [];
  const values = {} as Record<EnvKey, string>;

  for (const key of REQUIRED_ENV_KEYS) {
    const meta = ENV_METADATA[key];
    const fromSession = sessionEnv[key]?.trim() || '';
    const fromEnv = runtimeEnv[key]?.trim() || '';
    const fromLocal = localEnv[key]?.trim() || '';

    let value = '';
    let source: EnvSourceType = 'missing';

    if (fromSession) {
      value = fromSession;
      source = 'session';
    } else if (fromEnv) {
      value = fromEnv;
      source = 'env';
    } else if (fromLocal) {
      value = fromLocal;
      source = 'local';
    }

    const present = Boolean(value);
    if (present) {
      presentKeys.push(key);
    } else {
      missingKeys.push(key);
    }

    values[key] = value;
    statuses.push({
      key,
      label: meta.label,
      description: meta.description,
      isSecret: meta.isSecret,
      placeholder: meta.placeholder,
      present,
      source,
      value,
    });
  }

  const dotEnvSnippet = [
    '# Cloudinary Media Optimization & Unsigned Upload',
    `VITE_CLOUDINARY_CLOUD_NAME="${values.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name'}"`,
    `VITE_CLOUDINARY_UPLOAD_PRESET="${values.VITE_CLOUDINARY_UPLOAD_PRESET || 'your_unsigned_preset'}"`,
    '',
    '# Turso Edge SQLite Database',
    `TURSO_DATABASE_URL="${values.TURSO_DATABASE_URL || 'libsql://your-db-name.turso.io'}"`,
    `TURSO_AUTH_TOKEN="${values.TURSO_AUTH_TOKEN ? '********' : 'your_turso_auth_token'}"`,
  ].join('\n');

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    presentKeys,
    statuses,
    values,
    dotEnvSnippet,
  };
}
