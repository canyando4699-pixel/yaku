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

async function clearSession(cdp) {
  await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      localStorage.setItem("yaku-locale", "en");
      localStorage.removeItem("yaku-session");
      return true;
    })()`,
    returnByValue: true,
  });
}

async function ensureSession(cdp) {
  await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      localStorage.setItem("yaku-locale", "en");
      const session = {
        userId: "demo-user",
        email: "demo@yaku.app",
        displayName: "Yaku Demo"
      };
      localStorage.setItem("yaku-session", JSON.stringify(session));
      const accounts = [{
        id: "demo-user",
        email: "demo@yaku.app",
        displayName: "Yaku Demo",
        passwordHash: "x",
        salt: "x",
        createdAt: new Date().toISOString()
      }];
      localStorage.setItem("yaku-accounts", JSON.stringify(accounts));
      return true;
    })()`,
    returnByValue: true,
  });
}

async function goto(cdp, url) {
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url });
  await sleep(1800);
}

async function screenshot(cdp, file) {
  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data, "base64"));
  console.log("wrote", file);
}

async function clickText(cdp, text) {
  await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const nodes = Array.from(document.querySelectorAll("button, a, [role='button']"));
      const el = nodes.find((n) => (n.textContent || "").trim().includes(${JSON.stringify(text)}));
      if (el) { el.click(); return true; }
      return false;
    })()`,
    returnByValue: true,
  });
  await sleep(900);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const userData = path.join(__dirname, "..", ".tmp-chrome-ss");
  fs.mkdirSync(userData, { recursive: true });

  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userData}`,
      "--no-first-run",
      "--no-default-browser-check",
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
      deviceScaleFactor: 1,
      mobile: false,
    });

    await goto(cdp, BASE + "/");
    await clearSession(cdp);
    await goto(cdp, BASE + "/");
    await sleep(1500);
    await screenshot(cdp, "hero-en.png");

    await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        window.scrollTo(0, Math.min(document.body.scrollHeight * 0.42, 1100));
        return true;
      })()`,
    });
    await sleep(1000);
    await screenshot(cdp, "calendar-en.png");

    await goto(cdp, BASE + "/b/demo");
    await clearSession(cdp);
    await goto(cdp, BASE + "/b/demo");
    await sleep(1800);
    await screenshot(cdp, "demo-en.png");

    await goto(cdp, BASE + "/login");
    await clearSession(cdp);
    await goto(cdp, BASE + "/login");
    await sleep(1400);
    await screenshot(cdp, "login.png");

    await goto(cdp, BASE + "/");
    await ensureSession(cdp);
    await goto(cdp, BASE + "/host");
    await sleep(2200);
    await screenshot(cdp, "host-schedule.png");

    await clickText(cdp, "Availability");
    await sleep(1100);
    await screenshot(cdp, "host-availability.png");

    await clickText(cdp, "Share link");
    await sleep(1100);
    await screenshot(cdp, "host-share.png");

    await clickText(cdp, "List");
    await sleep(1100);
    await screenshot(cdp, "host-list.png");

    cdp.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
