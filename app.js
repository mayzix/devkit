
const $ = (id) => document.getElementById(id);
const input = $("input"), output = $("output"), status = $("status"), copy = $("copy");
let tool = "json";

const configs = {
  json: ["FORMAT & VALIDATE","JSON Formatter","Input JSON","Format JSON"],
  base64: ["ENCODE & DECODE","Base64 Converter","Text or Base64","Convert"],
  uuid: ["GENERATE IDENTIFIERS","UUID Generator","Optional: number of UUIDs (1–50)","Generate UUIDs"],
  jwt: ["INSPECT TOKENS","JWT Decoder","Paste a JWT token","Decode JWT"],
  url: ["ENCODE & DECODE","URL Encoder / Decoder","Text or URL-encoded text","Convert"],
  hash: ["CRYPTOGRAPHIC HASH","SHA-256 Generator","Text to hash","Generate SHA-256"],
  color: ["COLOR CONVERSION","Color Converter","Enter a HEX, RGB or HSL color","Convert color"]
};

function showResult(value, message="Done.") {
  output.textContent = value;
  copy.disabled = false;
  status.textContent = message;
}

function setTool(next) {
  tool = next;
  document.querySelectorAll(".tab").forEach(b =>
    b.classList.toggle("active", b.dataset.tool === tool)
  );
  const c = configs[tool];
  $("tool-kicker").textContent = c[0];
  $("tool-title").textContent = c[1];
  $("input-label").textContent = c[2];
  $("run").textContent = c[3];
  input.value = "";
  output.textContent = "Your result will appear here.";
  status.textContent = "";
  status.style.color = "";
  copy.disabled = true;
  input.placeholder = tool === "json"
    ? '{"hello":"world","count":3}'
    : tool === "uuid" ? "5"
    : tool === "color" ? "#3498db or rgb(52, 152, 219) or hsl(204, 70%, 53%)"
    : "Enter your input here…";
}

document.querySelectorAll(".tab").forEach(b =>
  b.addEventListener("click", () => setTool(b.dataset.tool))
);

function parseColor(value) {
  const s = value.trim().toLowerCase();
  let r, g, b;

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = [...hex].map(c => c + c).join("");
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const rgb = s.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
    if (rgb) {
      [r, g, b] = rgb.slice(1).map(Number);
      if ([r, g, b].some(v => v > 255)) throw Error("RGB values must be between 0 and 255.");
    } else {
      const hsl = s.match(/^hsl\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)$/);
      if (!hsl) throw Error("Use HEX (#3498db), RGB (rgb(52, 152, 219)) or HSL (hsl(204, 70%, 53%)).");

      let h = ((Number(hsl[1]) % 360) + 360) % 360 / 360;
      const sat = Number(hsl[2]) / 100;
      const light = Number(hsl[3]) / 100;
      if (sat > 1 || light > 1) throw Error("HSL saturation and lightness must be between 0% and 100%.");

      if (sat === 0) {
        r = g = b = Math.round(light * 255);
      } else {
        const hue = (p, q, t) => {
          if (t < 0) t++;
          if (t > 1) t--;
          if (t < 1/6) return p + (q-p)*6*t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q-p)*(2/3-t)*6;
          return p;
        };
        const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
        const p = 2 * light - q;
        r = Math.round(hue(p, q, h + 1/3) * 255);
        g = Math.round(hue(p, q, h) * 255);
        b = Math.round(hue(p, q, h - 1/3) * 255);
      }
    }
  }

  const toHex = n => n.toString(16).padStart(2, "0");
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const delta = max - min;
  let h = 0, sat = 0;
  const light = (max + min) / 2;

  if (delta !== 0) {
    sat = delta / (1 - Math.abs(2 * light - 1));
    if (max === r / 255) h = ((g - b) / 255 / delta) % 6;
    else if (max === g / 255) h = (b - r) / 255 / delta + 2;
    else h = (r - g) / 255 / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(h)}°, ${Math.round(sat * 100)}%, ${Math.round(light * 100)}%)`,
    preview: `Color preview: ${`#${toHex(r)}${toHex(g)}${toHex(b)}`}`
  };
}

$("run").addEventListener("click", async () => {
  const value = input.value;
  try {
    switch (tool) {
      case "json":
        showResult(JSON.stringify(JSON.parse(value), null, 2), "Valid JSON.");
        break;
      case "base64": {
        const decoded = atob(value.trim());
        showResult(new TextDecoder().decode(Uint8Array.from(decoded, c => c.charCodeAt(0))), "Base64 decoded.");
        break;
      }
      case "uuid": {
        const n = Number(value || 1);
        if (!Number.isInteger(n) || n < 1 || n > 50) throw Error("Enter a whole number from 1 to 50.");
        showResult(Array.from({length:n}, () => crypto.randomUUID()).join("\n"), `${n} UUID(s) generated.`);
        break;
      }
      case "jwt": {
        const parts = value.trim().split(".");
        if (parts.length !== 3) throw Error("A JWT must contain three dot-separated parts.");
        const decode = s => JSON.stringify(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)))), null, 2);
        showResult("HEADER\n" + decode(parts[0]) + "\n\nPAYLOAD\n" + decode(parts[1]) + "\n\nSignature: not verified. This tool only decodes the token.", "Decoded locally. Never share sensitive tokens.");
        break;
      }
      case "url": {
        let result;
        try { result = decodeURIComponent(value); }
        catch { result = encodeURIComponent(value); }
        showResult(result, "URL conversion complete.");
        break;
      }
      case "hash": {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
        showResult([...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join(""), "SHA-256 generated.");
        break;
      }
      case "color": {
        const color = parseColor(value);
        showResult(
          `HEX: ${color.hex}\nRGB: ${color.rgb}\nHSL: ${color.hsl}`,
          "Color converted successfully."
        );
        break;
      }
    }
  } catch (e) {
    output.textContent = "";
    copy.disabled = true;
    status.textContent = e.message || "Could not process this input.";
    status.style.color = "#ff9b9b";
    return;
  }
  status.style.color = "";
});

$("clear").addEventListener("click", () => {
  input.value = "";
  output.textContent = "Your result will appear here.";
  status.textContent = "";
  status.style.color = "";
  copy.disabled = true;
});

copy.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.textContent);
  status.textContent = "Copied to clipboard.";
});

// DevKit theme switcher
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  const savedTheme = localStorage.getItem("devkit-theme") || "dark";
  document.documentElement.dataset.theme = savedTheme;

  function updateThemeButton() {
    themeToggle.textContent =
      document.documentElement.dataset.theme === "dark"
        ? "☀️ Mode clair"
        : "🌙 Mode sombre";
  }

  updateThemeButton();

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem("devkit-theme", newTheme);
    updateThemeButton();
  });
}
