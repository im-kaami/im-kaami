const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const baseModules = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
const repoDir = 'E:/im-kaami';
const artifactDir = 'C:/Users/hafee/.gemini/antigravity/brain/7be91535-d10b-4731-9852-b61f8502a18d';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  console.log('=== INITIALIZING PLAYWRIGHT RENDER HARNESS (BOUNDED 420px) ===');
  const { chromium } = require(path.join(baseModules, 'playwright'));
  const { marked } = await import(pathToFileURL(path.join(baseModules, 'marked/lib/marked.esm.js')).href);

  // 1. Read README.md
  const readmePath = path.join(repoDir, 'README.md');
  const markdownSource = fs.readFileSync(readmePath, 'utf8');

  // Convert with marked
  const renderedBody = marked.parse(markdownSource);

  // 2. Build full HTML document with authentic GitHub styling and bounded img display
  const htmlDoc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Muhammad Ikram Hafeez (im-kaami) - Profile</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: light-dark(#ffffff, #0d1117);
      --fg: light-dark(#1f2328, #e6edf3);
      --fg-muted: light-dark(#656d76, #8b949e);
      --border: light-dark(#d0d7de, #30363d);
      --border-muted: light-dark(#d8dee4, #21262d);
      --link: light-dark(#0969da, #58a6ff);
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html {
      background-color: var(--bg);
      color: var(--fg);
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      background-color: var(--bg);
      color: var(--fg);
    }
    .markdown-body {
      width: 100%;
      max-width: 896px;
      margin: 0 auto;
      padding: 16px;
    }
    @media (min-width: 768px) {
      .markdown-body {
        padding: 32px;
      }
    }
    h1 {
      font-size: 26px;
      font-weight: 600;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-muted);
      margin-top: 0;
      margin-bottom: 16px;
    }
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 12px;
      color: var(--fg);
    }
    p {
      margin-top: 0;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    hr {
      border: 0;
      border-top: 1px solid var(--border-muted);
      margin: 24px 0;
    }
    a {
      color: var(--link);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul {
      padding-left: 24px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    li {
      margin-bottom: 6px;
      line-height: 1.5;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      border-radius: 6px;
    }
    picture {
      display: block;
      margin: 14px 0;
    }
    strong {
      font-weight: 600;
      color: var(--fg);
    }
    code {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 12px;
    }
    sub {
      font-size: 12px;
      color: var(--fg-muted);
    }
  </style>
</head>
<body>
  <div class="markdown-body">
    ${renderedBody}
  </div>
</body>
</html>`;

  const previewHtmlPath = path.join(repoDir, 'temp_playwright_preview.html');
  fs.writeFileSync(previewHtmlPath, htmlDoc, 'utf8');
  const previewUrl = pathToFileURL(previewHtmlPath).href;

  // 3. Launch browser
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const viewports = [320, 375, 768, 896];
  const colorSchemes = ['dark', 'light'];

  const report = {
    generated_at: new Date().toISOString(),
    renderer: 'Node.js + Playwright + marked + Google Chrome',
    runtime_node: process.version,
    chrome_path: chromePath,
    source_readme: readmePath,
    viewports_tested: viewports,
    color_schemes_tested: colorSchemes,
    results: []
  };

  for (const vpWidth of viewports) {
    const firstVpHeight = vpWidth <= 375 ? 667 : 800;

    for (const scheme of colorSchemes) {
      const caseId = `evidence-log-${vpWidth}px-${scheme}`;
      const context = await browser.newContext({
        viewport: { width: vpWidth, height: firstVpHeight },
        colorScheme: scheme,
        deviceScaleFactor: 1
      });

      const page = await context.newPage();
      await page.goto(previewUrl, { waitUntil: 'networkidle' });

      // Measure layout metrics, window.innerWidth, and image loading
      const pageMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;

        // Image details
        const images = Array.from(document.querySelectorAll('img')).map((img, idx) => {
          const rect = img.getBoundingClientRect();
          return {
            index: idx,
            alt: img.alt,
            currentSrc: img.currentSrc,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            renderedWidth: Math.round(rect.width * 10) / 10,
            renderedHeight: Math.round(rect.height * 10) / 10
          };
        });

        return {
          windowInnerWidth: window.innerWidth,
          windowInnerHeight: window.innerHeight,
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          scrollHeight: doc.scrollHeight,
          clientHeight: doc.clientHeight,
          bodyScrollWidth: body.scrollWidth,
          bodyClientWidth: body.clientWidth,
          bodyScrollHeight: body.scrollHeight,
          hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth || body.scrollWidth > body.clientWidth,
          images
        };
      });

      const fullPagePng = path.join(artifactDir, `${caseId}-full.png`);
      const viewportPng = path.join(artifactDir, `${caseId}-viewport.png`);

      // First-viewport screenshot (fullPage: false)
      await page.screenshot({ path: viewportPng, fullPage: false });

      // Full-page screenshot (fullPage: true)
      await page.screenshot({ path: fullPagePng, fullPage: true });

      // Keep carousel references up-to-date
      if (vpWidth === 375 && scheme === 'dark') {
        fs.copyFileSync(fullPagePng, path.join(artifactDir, 'evidence-log-mobile-dark.png'));
      } else if (vpWidth === 896 && scheme === 'dark') {
        fs.copyFileSync(fullPagePng, path.join(artifactDir, 'evidence-log-desktop-dark.png'));
      } else if (vpWidth === 896 && scheme === 'light') {
        fs.copyFileSync(fullPagePng, path.join(artifactDir, 'evidence-log-desktop-light.png'));
      }

      await context.close();

      const passed = !pageMetrics.hasHorizontalOverflow &&
                     pageMetrics.scrollWidth <= pageMetrics.clientWidth &&
                     pageMetrics.windowInnerWidth === vpWidth;
      const statusStr = passed ? 'PASS' : 'FAIL';

      report.results.push({
        case_id: caseId,
        viewport_requested: { width: vpWidth, height: firstVpHeight },
        actual_window_inner: { width: pageMetrics.windowInnerWidth, height: pageMetrics.windowInnerHeight },
        color_scheme: scheme,
        metrics: pageMetrics,
        zero_overflow_verified: passed,
        screenshots: {
          full_page: `${caseId}-full.png`,
          first_viewport: `${caseId}-viewport.png`
        }
      });

      const imgDims = pageMetrics.images.map(img => `${img.renderedWidth}x${img.renderedHeight}`).join(', ');
      console.log(`[${statusStr}] ${caseId}: innerW=${pageMetrics.windowInnerWidth}, scrollW=${pageMetrics.scrollWidth}, clientW=${pageMetrics.clientWidth}, scrollH=${pageMetrics.scrollHeight} | images: [${imgDims}]`);
    }
  }

  await browser.close();

  // 4. Measure SVG text bounding boxes and effective font sizes
  console.log('\n--- Measuring SVG Internal Label Sizes and Transformed Bounds ---');
  const svgFiles = [
    'assets/profile/masthead-dark.svg',
    'assets/profile/masthead-light.svg',
    'assets/profile/insightforge-flow-dark.svg',
    'assets/profile/insightforge-flow-light.svg',
    'assets/profile/xerox-reporting-dark.svg',
    'assets/profile/xerox-reporting-light.svg',
    'assets/profile/biorc800-comparison-dark.svg',
    'assets/profile/biorc800-comparison-light.svg'
  ];

  const svgMeasurements = [];
  const svgBrowser = await chromium.launch({ executablePath: chromePath, headless: true });
  const svgContext = await svgBrowser.newContext({ viewport: { width: 320, height: 600 } });
  const svgPage = await svgContext.newPage();

  for (const svgRel of svgFiles) {
    const svgPath = path.join(repoDir, svgRel);
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const pageHtml = `<!doctype html><html><body><div style="width:288px;">${svgContent}</div></body></html>`;
    await svgPage.setContent(pageHtml);

    const svgResult = await svgPage.evaluate((relPath) => {
      const svg = document.querySelector('svg');
      const vb = svg.viewBox.baseVal;
      const vbW = vb ? vb.width : 420;
      const vbH = vb ? vb.height : 150;
      const scaleAt320 = 288.0 / vbW;

      const texts = Array.from(document.querySelectorAll('text')).map(t => {
        const bb = t.getBBox();
        const style = window.getComputedStyle(t);
        const srcFs = parseFloat(style.fontSize);
        const effFs = Math.round(srcFs * scaleAt320 * 10) / 10;
        const clipped = (bb.x < -1 || bb.x + bb.width > vbW + 1 || bb.y < -1 || bb.y + bb.height > vbH + 1);
        return {
          text: t.textContent.trim().replace(/\s+/g, ' '),
          sourceFontSize: srcFs,
          effectiveSizeAt320: effFs,
          bbox: {
            x: Math.round(bb.x * 10) / 10,
            y: Math.round(bb.y * 10) / 10,
            width: Math.round(bb.width * 10) / 10,
            height: Math.round(bb.height * 10) / 10
          },
          clipped
        };
      });

      return {
        svg: relPath,
        viewBox: { width: vbW, height: vbH },
        scaleAt320: Math.round(scaleAt320 * 1000) / 1000,
        labels: texts,
        allLabelsMeet11px: texts.every(t => t.effectiveSizeAt320 >= 10.9),
        noClipping: texts.every(t => !t.clipped)
      };
    }, svgRel);

    svgMeasurements.push(svgResult);
    console.log(`[SVG CHECK] ${svgRel}: ${svgResult.labels.length} labels, scale=${svgResult.scaleAt320}, all>=11px=${svgResult.allLabelsMeet11px}, noClip=${svgResult.noClipping}`);
  }

  await svgBrowser.close();
  report.svg_measurements = svgMeasurements;

  // Clean up temporary HTML
  if (fs.existsSync(previewHtmlPath)) {
    fs.unlinkSync(previewHtmlPath);
  }

  // 5. Write final verification JSON
  const reportPath = path.join(artifactDir, 'render_verification_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nWrote complete verification report to ${reportPath}`);
})();
