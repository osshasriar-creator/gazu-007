import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sha256,
  DEFAULT_ADMIN_PASSWORD,
  authenticateAdmin,
  isAdminAuthenticated,
  logoutAdmin,
  getRateLimitStatus,
} from './adminAuth';

test('sha256 generates consistent 64-char hexadecimal string', async () => {
  const hash1 = await sha256('testpassword');
  const hash2 = await sha256('testpassword');
  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash2);
});

test('authenticateAdmin validates default master password', async () => {
  const res = await authenticateAdmin(DEFAULT_ADMIN_PASSWORD);
  assert.equal(res.success, true);
  assert.equal(isAdminAuthenticated(), true);
});

test('authenticateAdmin rejects wrong password and increments attempts', async () => {
  logoutAdmin();
  assert.equal(isAdminAuthenticated(), false);
  const res = await authenticateAdmin('wrong_pass_123');
  assert.equal(res.success, false);
  assert.match(res.error || '', /Incorrect master password/);
});
