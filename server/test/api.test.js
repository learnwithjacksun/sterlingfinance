import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryReplSet } from "mongodb-memory-server";

// Env must be set before the app modules are imported (config/env.js reads it once).
process.env.JWT_SECRET = "test-secret-test-secret-test-secret";
process.env.MONGO_URI = "mongodb://placeholder/test";
process.env.NODE_ENV = "test";
process.env.DISABLE_RATE_LIMIT = "1";
delete process.env.BREVO_API_KEY;

let repl, server, base, mongoose, models, hash, crypto;

before(async () => {
  repl = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ launchTimeout: 120000 }] });
  mongoose = (await import("mongoose")).default;
  await mongoose.connect(repl.getUri());
  const { createApp } = await import("../src/app.js");
  models = {
    ...(await import("../src/models/User.js")),
    ...(await import("../src/models/Transaction.js")),
    ...(await import("../src/models/Auth.js")),
  };
  hash = await import("../src/services/passwords.js");
  crypto = await import("../src/utils/crypto.js");
  await mongoose.syncIndexes();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server?.close();
  await mongoose?.disconnect();
  await repl?.stop();
});

const call = async (method, path, body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const profile = (email) => ({
  name: "Test User",
  email,
  password: "password123",
  pin: "1234",
  phone: "08012345678",
  currency: "$",
  accountType: "savings",
});

async function makeActiveUser(email, balance = 0) {
  const user = await models.User.create({
    name: "Funded User",
    email,
    passwordHash: await hash.hashPassword("password123"),
    pinHash: await hash.hashPin("1234"),
    accountNumber: String(Math.floor(1e9 + Math.random() * 9e9)),
    isActive: true,
    balance,
  });
  const login = await call("POST", "/auth/login", { email, password: "password123" });
  return { user, token: login.body.accessToken };
}

async function makeAdmin() {
  await models.Setting.findOneAndUpdate(
    { key: "adminPasscodeHash" },
    { value: await hash.hashPassword("secret-passcode") },
    { upsert: true },
  );
  await models.User.create({
    name: "Admin",
    email: "admin@test.com",
    role: "admin",
    passwordHash: await hash.hashPassword("adminpass123"),
    accountNumber: "9000000001",
  });
  const login = await call("POST", "/auth/login", { email: "admin@test.com", password: "adminpass123" });
  const pc = await call("POST", "/admin/auth/passcode", { passcode: "secret-passcode", refreshToken: login.body.refreshToken }, login.body.accessToken);
  return { login, token: pc.body.accessToken };
}

test("register, me, wrong and correct login", async () => {
  const reg = await call("POST", "/auth/register", profile("reg@test.com"));
  assert.equal(reg.status, 201);
  assert.ok(reg.body.accessToken && reg.body.refreshToken);
  assert.equal(reg.body.user.passwordHash, undefined);
  assert.equal(reg.body.user.balance, 0);
  assert.equal(reg.body.user.isActive, false);

  const me = await call("GET", "/auth/me", null, reg.body.accessToken);
  assert.equal(me.body.user.email, "reg@test.com");

  assert.equal((await call("POST", "/auth/login", { email: "reg@test.com", password: "wrongwrong" })).status, 401);
  assert.equal((await call("POST", "/auth/login", { email: "reg@test.com", password: "password123" })).status, 200);
  assert.equal((await call("POST", "/auth/register", profile("reg@test.com"))).status, 409);
});

test("a user without a password cannot log in; forgot/reset password sets one", async () => {
  await models.User.create({
    name: "Invited",
    email: "old@test.com",
    balance: 250,
    accountNumber: "1111111111",
  });

  const login = await call("POST", "/auth/login", { email: "old@test.com", password: "whatever123" });
  assert.equal(login.status, 401);
  assert.equal(login.body.error.code, "INVALID_CREDENTIALS");

  // forgot-password answers 200 for known and unknown emails alike
  assert.equal((await call("POST", "/auth/forgot-password", { email: "old@test.com" })).status, 200);
  assert.equal((await call("POST", "/auth/forgot-password", { email: "nobody@test.com" })).status, 200);
  assert.equal(await models.PasswordReset.countDocuments({}), 1);

  // The raw token only exists in the email, so replace the stored record with a known one.
  const user = await models.User.findOne({ email: "old@test.com" });
  await models.PasswordReset.deleteMany({});
  await models.PasswordReset.create({
    user: user._id,
    tokenHash: crypto.sha256("known-reset-token-123"),
    expiresAt: new Date(Date.now() + 60_000),
  });

  const reset = await call("POST", "/auth/reset-password", { token: "known-reset-token-123", password: "brandnew123" });
  assert.equal(reset.status, 200);
  assert.equal(reset.body.user.balance, 250, "balance must be untouched by a password reset");
  // single use
  assert.equal((await call("POST", "/auth/reset-password", { token: "known-reset-token-123", password: "another12345" })).status, 400);
  assert.equal((await call("POST", "/auth/login", { email: "old@test.com", password: "brandnew123" })).status, 200);
});

test("refresh rotates, and reusing an old refresh token revokes the session", async () => {
  const first = await call("POST", "/auth/register", profile("rot@test.com"));
  const second = await call("POST", "/auth/refresh", { refreshToken: first.body.refreshToken });
  assert.equal(second.status, 200);
  assert.notEqual(second.body.refreshToken, first.body.refreshToken);

  const replay = await call("POST", "/auth/refresh", { refreshToken: first.body.refreshToken });
  assert.equal(replay.status, 401);
  // the newest token of that chain is revoked too
  assert.equal((await call("POST", "/auth/refresh", { refreshToken: second.body.refreshToken })).status, 401);
});

test("transfer checks PIN, activity and balance; concurrent debits never overdraw", async () => {
  const { user, token } = await makeActiveUser("rich@test.com", 100);

  const badPin = await call("POST", "/me/transfer", { amount: 10, pin: "9999", description: "x" }, token);
  assert.equal(badPin.status, 400);
  assert.equal(badPin.body.error.code, "WRONG_PIN");

  const tooMuch = await call("POST", "/me/transfer", { amount: 500, pin: "1234", description: "x" }, token);
  assert.equal(tooMuch.body.error.code, "INSUFFICIENT_FUNDS");

  const results = await Promise.all(
    Array.from({ length: 10 }, () => call("POST", "/me/transfer", { amount: 30, pin: "1234", description: "race" }, token)),
  );
  const ok = results.filter((r) => r.status === 201).length;
  assert.equal(ok, 3, "only three 30-unit transfers fit into 100");

  const fresh = await models.User.findById(user._id);
  assert.equal(fresh.balance, 10);
  assert.equal(await models.Transaction.countDocuments({ user: user._id }), 3);

  const inactive = await makeActiveUser("inactive@test.com", 100);
  await models.User.updateOne({ _id: inactive.user._id }, { isActive: false });
  const blocked = await call("POST", "/me/transfer", { amount: 10, pin: "1234", description: "x" }, inactive.token);
  assert.equal(blocked.status, 403);
});

test("admin routes need role and passcode", async () => {
  const customer = await makeActiveUser("plain@test.com");
  assert.equal((await call("GET", "/admin/users", null, customer.token)).status, 403);

  await models.Setting.findOneAndUpdate({ key: "adminPasscodeHash" }, { value: await hash.hashPassword("secret-passcode") }, { upsert: true });
  await models.User.create({
    name: "Admin2",
    email: "admin2@test.com",
    role: "admin",
    passwordHash: await hash.hashPassword("adminpass123"),
    accountNumber: "9000000002",
  });
  const login = await call("POST", "/auth/login", { email: "admin2@test.com", password: "adminpass123" });
  const noPasscode = await call("GET", "/admin/users", null, login.body.accessToken);
  assert.equal(noPasscode.status, 403);
  assert.equal(noPasscode.body.error.code, "PASSCODE_REQUIRED");

  const wrong = await call("POST", "/admin/auth/passcode", { passcode: "nope" }, login.body.accessToken);
  assert.equal(wrong.body.error.code, "WRONG_PASSCODE");

  const right = await call("POST", "/admin/auth/passcode", { passcode: "secret-passcode", refreshToken: login.body.refreshToken }, login.body.accessToken);
  assert.equal(right.status, 200);
  assert.equal((await call("GET", "/admin/users", null, right.body.accessToken)).status, 200);

  // the passcode flag survives a refresh
  const refreshed = await call("POST", "/auth/refresh", { refreshToken: right.body.refreshToken });
  assert.equal((await call("GET", "/admin/users", null, refreshed.body.accessToken)).status, 200);
});

test("admin fund/debit are atomic; failing a debit refunds it", async () => {
  const admin = await makeAdminOnce();
  const { user } = await makeActiveUser("target@test.com", 50);

  const fund = await call("POST", `/admin/users/${user._id}/fund`, { amount: 25.5, description: "bonus" }, admin);
  assert.equal(fund.status, 201);
  assert.equal(fund.body.user.balance, 75.5);
  assert.equal(fund.body.transaction.balanceAfter, 75.5);

  const over = await call("POST", `/admin/users/${user._id}/debit`, { amount: 1000, description: "x" }, admin);
  assert.equal(over.body.error.code, "INSUFFICIENT_FUNDS");
  assert.equal((await models.User.findById(user._id)).balance, 75.5);

  const debit = await call("POST", `/admin/users/${user._id}/debit`, { amount: 40, description: "fee" }, admin);
  assert.equal(debit.body.user.balance, 35.5);
  const txId = debit.body.transaction.id;

  const failed = await call("PATCH", `/admin/transactions/${txId}`, { status: "failed" }, admin);
  assert.equal(failed.body.user.balance, 75.5, "failed debit is refunded");
  const again = await call("PATCH", `/admin/transactions/${txId}`, { status: "failed" }, admin);
  assert.equal(again.body.user, null, "no second refund");
  assert.equal((await models.User.findById(user._id)).balance, 75.5);

  const back = await call("PATCH", `/admin/transactions/${txId}`, { status: "success" }, admin);
  assert.equal(back.body.user.balance, 35.5, "moving out of failed charges it again");

  // deleting a user removes their ledger
  assert.equal((await call("DELETE", `/admin/users/${user._id}`, null, admin)).status, 200);
  assert.equal(await models.Transaction.countDocuments({ user: user._id }), 0);
});

let adminToken;
async function makeAdminOnce() {
  adminToken ??= (await makeAdmin()).token;
  return adminToken;
}
