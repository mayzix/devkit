content = r'''const $ = (id) => document.getElementById(id);
const input = $("input");
const output = $("output");
const status = $("status");
const copy = $("copy");
const colorPreview = $("color-preview");

let tool = "json";

const configs = {
  json: ["FORMAT & VALIDATE", "JSON Formatter", "Input JSON", "Format JSON"],
  base64: ["ENCODE & DECODE", "Base64 Converter", "Text or Base64", "Convert"],
  uuid: ["GENERATE IDENTIFIERS", "UUID Generator", "Optional: number of UUIDs (1–50)", "Generate UUIDs"],
  jwt: ["INSPECT TOKENS", "JWT Decoder", "Paste a JWT token", "Decode JWT"],
  url: ["ENCODE & DECODE", "URL Encoder / Decoder", "Text or URL-encoded text", "Convert"],
  hash: ["CRYPTOGRAPHIC HASH", "SHA-256 Generator", "Text to hash", "Generate SHA-256"],
  color: ["COLOR CONVERSION", "Color Converter", "Enter a HEX, RGB or HSL color", "Convert color"]
};

function showResult(value, message = "Done.") {
  output.textContent = value;
  copy.disabled = false;
  status.textContent = message;
}

function setTool(next) {
  tool = next;
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === tool);
  });

  const config = configs[tool];
  $("tool-kicker").textContent = config[0];
  $("tool-title").textContent = config[1];
  $("input-label").textContent = config[2];
  $("run").textContent = config[3];

  input.value = "";
  output.textContent = "Your result will appear here.";
  status.textContent = "";
  status.style.color = "";
  copy.disabled = true;

  if (colorPreview) {
    colorPreview.hidden = true;
    colorPreview.style.backgroundColor = "";
  }

  input.placeholder = tool === "json"
    ? '{"hello":"world","count":3}'
    : tool === "uuid"
      ? "5"
      : tool === "color"
        ? "#3498db or rgb(52, 152, 219) or hsl(204, 70%, 53%)"
        : "Enter your input here…";
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});

function parseColor(value) {
  const text = value.trim().toLowerCase();
  let r, g, b;

  const hexMatch = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const rgbMatch = text.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);

    if (rgbMatch) {
      [r, g, b] = rgbMatch.slice(1).map(Number);
      if ([r, g, b].some((v) => v > 255)) {
        throw new Error("RGB values must be between 0 and 255.");
      }
    } else {
      const hslMatch = text.match(/^hsl\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)$/);

      if (!hslMatch) {
        throw new Error("Use HEX (#3498db), RGB (rgb(52, 152, 219)) or HSL (hsl(204, 70%, 53%)).");
      }

      const h = (((Number(hslMatch[1]) % 360) + 360) % 360) / 360;
      const s = Number(hslMatch[2]) / 100;
      const l = Number(hslMatch[3]) / 100;

      if (s > 1 || l > 1) {
        throw new Error("HSL saturation and lightness must be between 0% and 100%.");
      }

      if (s === 0) {
        r = g = b = Math.round(l * 255);
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const hueToRgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
        g = Math.round(hueToRgb(p, q, h) * 255);
        b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);
      }
    }
  }

  const red = r / 255, green = g / 255, blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0, saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
    if (hue < 0) hue += 360;
  }

  const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(hue)}°, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`
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
        showResult(
          new TextDecoder().decode(Uint8Array.from(decoded, (c) => c.charCodeAt(0))),
          "Base64 decoded."
        );
        break;
      }

      case "uuid": {
        const count = Number(value || 1);
        if (!Number.isInteger(count) || count < 1 || count > 50) {
          throw new Error("Enter a whole number from 1 to 50.");
        }
        showResult(Array.from({ length: count }, () => crypto.randomUUID()).join("\n"), `${count} UUID(s) generated.`);
        break;
      }

      case "jwt": {
        const parts = value.trim().split(".");
        if (parts.length !== 3) throw new Error("A JWT must contain three dot-separated parts.");
        const decode = (part) => {
          const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
          const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
          return JSON.stringify(JSON.parse(new TextDecoder().decode(bytes)), null, 2);
        };
        showResult(
          `HEADER\n${decode(parts[0])}\n\nPAYLOAD\n${decode(parts[1])}\n\nSignature: not verified. This tool only decodes the token.`,
          "Decoded locally. Never share sensitive tokens."
        );
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
        const hash = [...new Uint8Array(digest)].map((v) => v.toString(16).padStart(2, "0")).join("");
        showResult(hash, "SHA-256 generated.");
        break;
      }

      case "color": {
        const color = parseColor(value);
        showResult(`HEX: ${color.hex}\nRGB: ${color.rgb}\nHSL: ${color.hsl}`, "Color converted successfully.");
        if (colorPreview) {
          colorPreview.style.backgroundColor = color.hex;
          colorPreview.hidden = false;
        }
        break;
      }
    }
    status.style.color = "";
  } catch (error) {
    output.textContent = "";
    copy.disabled = true;
    status.textContent = error.message || "Could not process this input.";
    status.style.color = "#ff9b9b";
    if (colorPreview) {
      colorPreview.hidden = true;
      colorPreview.style.backgroundColor = "";
    }
  }
});

$("clear").addEventListener("click", () => {
  input.value = "";
  output.textContent = "Your result will appear here.";
  status.textContent = "";
  status.style.color = "";
  copy.disabled = true;
  if (colorPreview) {
    colorPreview.hidden = true;
    colorPreview.style.backgroundColor = "";
  }
});

copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.textContent);
    status.textContent = "Copied to clipboard.";
  } catch {
    status.textContent = "Clipboard access is unavailable in this browser.";
  }
});

// DevKit theme switcher
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  const savedTheme = localStorage.getItem("devkit-theme") || "dark";
  document.documentElement.dataset.theme = savedTheme;

  function updateThemeButton() {
    themeToggle.textContent = document.documentElement.dataset.theme === "dark"
      ? "☀️ Mode clair"
      : "🌙 Mode sombre";
  }

  updateThemeButton();

  themeToggle.addEventListener("click", () => {
    const newTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem("devkit-theme", newTheme);
    updateThemeButton();
  });
}
'''
import os
os.makedirs("/mnt/data", exist_ok=True)
with open("/mnt/data/app.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Fichier app.js créé.")
# Save the complete JavaScript file under a fresh filename.
with open("/mnt/data/devkit-app-final.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Fichier prêt : devkit-app-final.js")
