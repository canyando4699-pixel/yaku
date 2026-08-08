import { mkdir } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "screenshots");
const BASE = "http://127.0.0.1:3000";
const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, type: "png" });
  console.log("wrote", file);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  args: ["--hide-scrollbars", "--disable-gpu"],
});

try {
  await mkdir(OUT, { recursive: true });
  const page = await browser.newPage();

  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 60_000 });
  await page.evaluate(() => {
    localStorage.setItem("yaku-locale", "en");
  });
  await page.reload({ waitUntil: "networkidle0", timeout: 60_000 });
  // Wait for wordmark fade-in (~3.9s) + paint
  await page.waitForSelector(".yaku-wordmark", { timeout: 15_000 });
  await new Promise((r) => setTimeout(r, 4500));
  await shot(page, "hero.png");

  // Bring calendar section into view and force the reveal styles for a clean shot
  await page.evaluate(() => {
    const section = [...document.querySelectorAll("section")].find((el) =>
      el.className.includes("min-h-[145vh]"),
    );
    if (!section) throw new Error("calendar section missing");
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + window.innerHeight * 0.35);
    section.querySelectorAll(".will-change-transform").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  });
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, "calendar.png");

  await page.goto(BASE + "/b/demo", {
    waitUntil: "networkidle0",
    timeout: 60_000,
  });
  await page.evaluate(() => {
    localStorage.setItem("yaku-locale", "en");
  });
  await page.reload({ waitUntil: "networkidle0", timeout: 60_000 });
  await page.waitForSelector("h1", { timeout: 15_000 });
  await new Promise((r) => setTimeout(r, 1200));
  await shot(page, "demo.png");
} finally {
  await browser.close();
}
