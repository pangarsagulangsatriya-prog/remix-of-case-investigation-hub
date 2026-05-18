import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("pageerror", (err) => {
    console.error("\n[PAGE ERROR EXCEPTION]:", err.message);
    console.error(err.stack);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error("\n[BROWSER CONSOLE ERROR]:", msg.text());
    } else {
      console.log("[BROWSER CONSOLE]:", msg.text());
    }
  });

  console.log("Navigating to http://localhost:8080/cases/new...");
  try {
    await page.goto("http://localhost:8080/cases/new", { waitUntil: "networkidle", timeout: 10000 });
    console.log("Navigation complete. Waiting 3 seconds for active render...");
    await page.waitForTimeout(3000);
  } catch (err) {
    console.error("Navigation error:", err);
  }

  await browser.close();
}

main().catch(console.error);
