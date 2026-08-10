import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(__dirname, "..", "docs", "screenshots");
const PORT = 9333;
const VIEWPORT = { width: 1440, height: 900 };
const DPR = 1;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpJson(urlPath) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: "127.0.0.1", port: PORT, path: urlPath }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

class Cdp {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  ready() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve());
      this.ws.addEventListener("error", reject);
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function waitForChrome(retries = 40) {
  for (let i = 0; i < retries; i += 1) {
    try {
      return await httpJson("/json/version");
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Chrome CDP not ready");
}

async function evalExpr(cdp, expression) {
  return cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
}

async function forceEnglish(cdp) {
  await evalExpr(
    cdp,
    `(() => {
      localStorage.setItem("yaku-locale", "en");
      document.documentElement.lang = "en";
      return localStorage.getItem("yaku-locale");
    })()`,
  );
}

async function waitForImages(cdp, minReady = 1, retries = 45) {
  for (let i = 0; i < retries; i += 1) {
    const result = await evalExpr(
      cdp,
      `(() => {
        const imgs = Array.from(document.images);
        const ready = imgs.filter((img) => img.complete && img.naturalWidth > 200);
        return { total: imgs.length, ready: ready.length };
      })()`,
    );
    const v = result?.result?.value;
    if (v && v.ready >= minReady) {
      console.log("images-ready", JSON.stringify(v));
      return;
    }
    await sleep(1000);
  }
  console.log("images-timeout");
}

async function clearSession(cdp) {
  await evalExpr(
    cdp,
    `(() => {
      localStorage.setItem("yaku-locale", "en");
      localStorage.removeItem("yaku-session");
      return true;
    })()`,
  );
}

async function ensureSession(cdp) {
  await evalExpr(
    cdp,
    `(() => {
      localStorage.setItem("yaku-locale", "en");
      localStorage.setItem("yaku-session", JSON.stringify({
        userId: "demo-user",
        email: "demo@yaku.app",
        displayName: "Yaku Demo"
      }));
      localStorage.setItem("yaku-accounts", JSON.stringify([{
        id: "demo-user",
        email: "demo@yaku.app",
        displayName: "Yaku Demo",
        passwordHash: "x",
        salt: "x",
        createdAt: new Date().toISOString()
      }]));
      return true;
    })()`,
  );
}

async function goto(cdp, url) {
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url });
  await sleep(2500);
  await forceEnglish(cdp);
  await evalExpr(
    cdp,
    `document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true`,
  );
  await evalExpr(
    cdp,
    `Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve(true)
          : new Promise((resolve) => {
              img.addEventListener("load", () => resolve(true), { once: true });
              img.addEventListener("error", () => resolve(false), { once: true });
            }),
      ),
    ).then(() => true)`,
  );
  await sleep(800);
}

async function screenshot(cdp, file) {
  const capture = cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`screenshot timeout: ${file}`)), 20000),
  );
  const { data } = await Promise.race([capture, timeout]);
  const outPath = path.join(OUT, file);
  fs.writeFileSync(outPath, Buffer.from(data, "base64"));
  const stat = fs.statSync(outPath);
  console.log("wrote", file, `(${stat.size} bytes)`);
}

async function clickNav(cdp, text) {
  const result = await evalExpr(
    cdp,
    `(() => {
      const nodes = Array.from(document.querySelectorAll("button, a"));
      const el = nodes.find((n) => (n.textContent || "").replace(/\\s+/g, " ").trim() === ${JSON.stringify(text)} ||
        (n.textContent || "").includes(${JSON.stringify(text)}));
      if (!el) return false;
      el.click();
      return (el.textContent || "").trim();
    })()`,
  );
  console.log("click", text, "->", result?.result?.value);
  await sleep(1400);
}

async function assertEnglish(cdp, label) {
  const result = await evalExpr(
    cdp,
    `(() => {
      const body = document.body.innerText || "";
      const hasGerman = /Anmelden|Verfügbarkeit|Termin mit|Datum wählen|Uhrzeit wählen|Link teilen/.test(body);
      const langBtn = Array.from(document.querySelectorAll("button")).some((b) => /English/.test(b.textContent || ""));
      return { hasGerman, langBtn, sample: body.slice(0, 120) };
    })()`,
  );
  const v = result?.result?.value;
  console.log("lang-check", label, JSON.stringify(v));
  if (v?.hasGerman) {
    throw new Error(`Page still shows German UI: ${label}`);
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const userData = path.join(__dirname, "..", ".tmp-chrome-ss");
  fs.rmSync(userData, { recursive: true, force: true });
  fs.mkdirSync(userData, { recursive: true });

  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userData}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-dev-shm-usage",
      `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    await waitForChrome();
    const targets = await httpJson("/json/list");
    const page =
      targets.find((t) => t.type === "page") ||
      (await httpJson("/json/new?about:blank"));
    const cdp = new Cdp(page.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      deviceScaleFactor: DPR,
      mobile: false,
    });

    // Landing hero
    await goto(cdp, BASE + "/");
    await clearSession(cdp);
    await goto(cdp, BASE + "/");
    await waitForImages(cdp, 1);
    await sleep(1500);
    await assertEnglish(cdp, "hero");
    await screenshot(cdp, "hero-en.png");

    // Landing calendar
    await evalExpr(
      cdp,
      `window.scrollTo(0, Math.min(document.body.scrollHeight * 0.45, 1200))`,
    );
    await sleep(1200);
    await screenshot(cdp, "calendar-en.png");

    // Booking
    await goto(cdp, BASE + "/b/demo");
    await clearSession(cdp);
    await goto(cdp, BASE + "/b/demo");
    await waitForImages(cdp, 1);
    await sleep(1500);
    await assertEnglish(cdp, "booking");
    await screenshot(cdp, "demo-en.png");

    // Login
    await goto(cdp, BASE + "/login");
    await clearSession(cdp);
    await goto(cdp, BASE + "/login");
    await waitForImages(cdp, 1);
    await sleep(1200);
    await assertEnglish(cdp, "login");
    await screenshot(cdp, "login.png");

    // Host schedule
    await goto(cdp, BASE + "/");
    await ensureSession(cdp);
    await goto(cdp, BASE + "/host");
    await sleep(2500);
    await assertEnglish(cdp, "host-schedule");
    await screenshot(cdp, "host-schedule.png");

    await clickNav(cdp, "List");
    await sleep(1000);
    await screenshot(cdp, "host-list.png");

    await clickNav(cdp, "Availability");
    await sleep(1200);
    await assertEnglish(cdp, "host-availability");
    await screenshot(cdp, "host-availability.png");

    await clickNav(cdp, "Share link");
    await sleep(1200);
    await screenshot(cdp, "host-share.png");

    cdp.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
