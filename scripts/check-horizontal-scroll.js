import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = 'http://localhost:57319';
const routes = [
  {
    name: 'entry-price-calculator',
    path: '/entry-price-calculator',
  },
];

const viewports = [
  { width: 1280, height: 720 },
  { width: 1024, height: 720 },
  { width: 900, height: 900 },
];

const outputDir = path.join('logs', 'playwright');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function checkHorizontalScroll(page) {
  return page.evaluate(() => {
    const bodyHasScroll = document.body.scrollWidth > document.body.clientWidth + 1;
    const docHasScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

    const overflowElements = Array.from(document.querySelectorAll('*'))
      .map((el) => {
        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;
        if (scrollWidth > clientWidth + 1) {
          return {
            tag: el.tagName,
            className: el.className,
            id: el.id,
            width: clientWidth,
            scrollWidth,
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 15);

    return {
      bodyHasScroll,
      docHasScroll,
      overflowElements,
    };
  });
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = [];

  try {
    for (const { name, path: routePath } of routes) {
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        const scrollInfo = await checkHorizontalScroll(page);
        const screenshotFile = path.join(
          outputDir,
          `${name}-${viewport.width}x${viewport.height}.png`
        );
        await page.screenshot({ path: screenshotFile, fullPage: true });

        results.push({
          route: name,
          path: routePath,
          viewport,
          scrollInfo,
          screenshot: screenshotFile,
        });
      }
    }
  } finally {
    await browser.close();
  }

  const hasIssues = results.some((result) =>
    result.scrollInfo.bodyHasScroll ||
    result.scrollInfo.docHasScroll ||
    result.scrollInfo.overflowElements.length > 0
  );

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl,
    results,
    hasIssues,
  };

  const reportFile = path.join(outputDir, 'horizontal-scroll-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (hasIssues) {
    throw new Error('检测到水平滚动问题，请查看报告。');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
