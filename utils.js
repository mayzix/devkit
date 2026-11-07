
(function (root) {
  "use strict";

  function formatJSON(value) {
    return JSON.stringify(JSON.parse(value), null, 2);
  }

  function encodeBase64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach(byte => binary += String.fromCharCode(byte));

    if (typeof btoa === "function") return btoa(binary);
    return Buffer.from(bytes).toString("base64");
  }

  function decodeBase64(value) {
    const clean = value.trim();
    if (!clean || !/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 !== 0) {
      throw new Error("Invalid Base64 input");
    }

    let bytes;
    if (typeof atob === "function") {
      const binary = atob(clean);
      bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    } else {
      bytes = new Uint8Array(Buffer.from(clean, "base64"));
      if (Buffer.from(bytes).toString("base64") !== clean) {
        throw new Error("Invalid Base64 input");
      }
    }

    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }

  function generateUUIDs(count = 1) {
    if (!Number.isInteger(count) || count < 1 || count > 50) {
      throw new Error("Count must be between 1 and 50");
    }
    if (!root.crypto || !root.crypto.randomUUID) {
      throw new Error("Secure UUID generation is unavailable");
    }
    return Array.from({ length: count }, () => root.crypto.randomUUID());
  }

  function decodeJWT(token) {
    const parts = token.trim().split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT structure");

    function decodePart(part) {
      const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
      let binary;

      if (typeof atob === "function") {
        binary = atob(padded);
      } else {
        binary = Buffer.from(padded, "base64").toString("binary");
      }

      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    }

    return {
      header: decodePart(parts[0]),
      payload: decodePart(parts[1]),
      signature: parts[2]
    };
  }

  function convertURL(value) {
    try {
      const decoded = decodeURIComponent(value);
      if (decoded !== value) return decoded;
    } catch (_) {}
    return encodeURIComponent(value);
  }

  async function sha256(value) {
    if (!root.crypto || !root.crypto.subtle) {
      throw new Error("Web Crypto requires HTTPS or localhost");
    }
    const digest = await root.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );
    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  const api = {
    formatJSON,
    encodeBase64,
    decodeBase64,
    generateUUIDs,
    decodeJWT,
    convertURL,
    sha256
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.DevKitUtils = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
