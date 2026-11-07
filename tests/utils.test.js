
const test = require("node:test");
const assert = require("node:assert/strict");
const { webcrypto } = require("node:crypto");

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const utils = require("../utils.js");

test("formats valid JSON", () => {
  assert.equal(
    utils.formatJSON('{"name":"DevKit"}'),
    '{\n  "name": "DevKit"\n}'
  );
});

test("rejects invalid JSON", () => {
  assert.throws(() => utils.formatJSON("{invalid}"));
});

test("encodes and decodes Base64", () => {
  const text = "Bonjour développeur 🚀";
  assert.equal(
    utils.decodeBase64(utils.encodeBase64(text)),
    text
  );
});

test("generates five unique UUIDs", () => {
  const ids = utils.generateUUIDs(5);
  assert.equal(ids.length, 5);
  assert.equal(new Set(ids).size, 5);
});

test("rejects invalid UUID counts", () => {
  assert.throws(() => utils.generateUUIDs(0));
  assert.throws(() => utils.generateUUIDs(51));
});

test("decodes a JWT", () => {
  const token =
    "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0In0.signature";

  const result = utils.decodeJWT(token);

  assert.equal(result.header.alg, "none");
  assert.equal(result.payload.sub, "1234");
});

test("rejects malformed JWT", () => {
  assert.throws(() => utils.decodeJWT("invalid-token"));
});

test("decodes URL text", () => {
  assert.equal(
    utils.convertURL("hello%20world"),
    "hello world"
  );
});

test("encodes URL text", () => {
  assert.equal(
    utils.convertURL("hello world"),
    "hello%20world"
  );
});
