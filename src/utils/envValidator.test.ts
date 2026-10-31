import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEnvironment,
  saveEphemeralEnv,
  getEphemeralEnv,
  clearEphemeralEnv,
  REQUIRED_ENV_KEYS,
} from './envValidator';

test('validateEnvironment identifies all 4 missing keys when no sources are configured', () => {
  clearEphemeralEnv();
  const result = validateEnvironment({
    metaEnv: {},
    processEnv: {},
    sessionEnv: {},
    localEnv: {},
  });

  assert.equal(result.isValid, false);
  assert.deepEqual(result.missingKeys, [...REQUIRED_ENV_KEYS]);
  assert.equal(result.presentKeys.length, 0);
});

test('validateEnvironment detects partial configuration and reports exact missing keys', () => {
  const result = validateEnvironment({
    metaEnv: {
      VITE_CLOUDINARY_CLOUD_NAME: 'gazu-cloud',
      VITE_CLOUDINARY_UPLOAD_PRESET: 'gazu-unsigned',
    },
    processEnv: {},
    sessionEnv: {},
    localEnv: {},
  });

  assert.equal(result.isValid, false);
  assert.deepEqual(result.presentKeys, [
    'VITE_CLOUDINARY_CLOUD_NAME',
    'VITE_CLOUDINARY_UPLOAD_PRESET',
  ]);
  assert.deepEqual(result.missingKeys, ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN']);
});

test('validateEnvironment passes when .env and ephemeral session variables complete all 4 keys', () => {
  const result = validateEnvironment({
    metaEnv: {
      VITE_CLOUDINARY_CLOUD_NAME: 'gazu-cloud',
      VITE_CLOUDINARY_UPLOAD_PRESET: 'gazu-unsigned',
    },
    processEnv: {},
    sessionEnv: {
      TURSO_DATABASE_URL: 'libsql://gazu-db.turso.io',
      TURSO_AUTH_TOKEN: 'secret-token-123',
    },
    localEnv: {},
  });

  assert.equal(result.isValid, true);
  assert.equal(result.missingKeys.length, 0);
  assert.equal(result.values.VITE_CLOUDINARY_CLOUD_NAME, 'gazu-cloud');
  assert.equal(result.values.TURSO_DATABASE_URL, 'libsql://gazu-db.turso.io');

  const tursoUrlStatus = result.statuses.find((s) => s.key === 'TURSO_DATABASE_URL');
  const cloudNameStatus = result.statuses.find((s) => s.key === 'VITE_CLOUDINARY_CLOUD_NAME');
  assert.equal(tursoUrlStatus?.source, 'session');
  assert.equal(cloudNameStatus?.source, 'env');
});

test('saveEphemeralEnv and clearEphemeralEnv manage ephemeral session overrides cleanly', () => {
  clearEphemeralEnv();
  saveEphemeralEnv({
    VITE_CLOUDINARY_CLOUD_NAME: '  ephemeral-cloud  ',
    TURSO_DATABASE_URL: 'libsql://ephemeral.turso.io',
  });

  const saved = getEphemeralEnv();
  assert.equal(saved.VITE_CLOUDINARY_CLOUD_NAME, 'ephemeral-cloud');
  assert.equal(saved.TURSO_DATABASE_URL, 'libsql://ephemeral.turso.io');

  clearEphemeralEnv();
  assert.deepEqual(getEphemeralEnv(), {});
});
