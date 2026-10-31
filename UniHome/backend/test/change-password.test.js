const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');
test('password change requires login/current password and accepts new password for login', async (t) => {
  const secret = 'password-change-test-secret-more-than-32-bytes';
  const user = { _id: 1, email: 'user@example.com', hoTen: 'User', matKhau: 'old-password', vaiTro: 'user', trangThai: 'hoat_dong' };
  const users = {
    async findById() { return user; },
    findOne() { return { select: async () => user }; },
    async findOneAndUpdate(filter, update) {
      if (filter._id !== user._id || filter.matKhau !== user.matKhau || filter.trangThai !== user.trangThai) return null;
      Object.assign(user, update.$set); return user;
    }
  };
  const server = createApp({ secret, users }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const token = jwt.sign({}, secret, { subject: '1', issuer: 'unihome', audience: 'unihome-api' });
  async function post(path, body, signedIn = true) {
    return fetch(`http://127.0.0.1:${server.address().port}/api/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(signedIn ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  }
  const valid = { currentPassword: 'old-password', newPassword: 'new-password' };
  assert.equal((await post('change-password', valid, false)).status, 401);
  for (const body of [{}, { ...valid, currentPassword: 'wrong' }, { ...valid, newPassword: 'short' }, { ...valid, newPassword: 'old-password' }, { ...valid, newPassword: 'á'.repeat(40) }]) {
    assert.equal((await post('change-password', body)).status, 400);
    assert.equal(user.matKhau, 'old-password');
  }
  const changed = await post('change-password', valid);
  assert.equal(changed.status, 200);
  assert.equal((await changed.json()).matKhau, undefined);
  assert.equal(user.matKhau, 'new-password');
  assert.equal((await post('login', { email: user.email, password: 'old-password' })).status, 401);
  assert.equal((await post('login', { email: user.email, password: 'new-password' })).status, 200);
});
