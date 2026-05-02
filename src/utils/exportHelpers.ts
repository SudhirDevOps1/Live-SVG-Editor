export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  );
}

export function downloadSvg(svgCode: string, filename = 'image.svg'): void {
  downloadFile(filename, svgCode, 'image/svg+xml');
}

export function downloadReactComponent(code: string, filename = 'SvgIcon.jsx'): void {
  downloadFile(filename, code, 'text/javascript');
}

export function downloadHtml(code: string, filename = 'svg-image.html'): void {
  downloadFile(filename, code, 'text/html');
}

// ================================================================
// SVG Dimension Parsing
// ================================================================

function getSvgDimensions(svgCode: string): { width: number; height: number } {
  const widthMatch = svgCode.match(/\bwidth\s*=\s*"([\d.]+)(px|em|rem|%)?"/);
  const heightMatch = svgCode.match(/\bheight\s*=\s*"([\d.]+)(px|em|rem|%)?"/);

  if (widthMatch && heightMatch) {
    const w = parseFloat(widthMatch[1]);
    const h = parseFloat(heightMatch[1]);
    if (w > 0 && h > 0) return { width: w, height: h };
  }

  const viewBoxMatch = svgCode.match(/\bviewBox\s*=\s*"([\d.\-]+)\s+([\d.\-]+)\s+([\d.]+)\s+([\d.]+)"/);
  if (viewBoxMatch) {
    const w = parseFloat(viewBoxMatch[3]);
    const h = parseFloat(viewBoxMatch[4]);
    if (w > 0 && h > 0) return { width: w, height: h };
  }

  return { width: 400, height: 300 };
}

// ================================================================
// Font Embedding for PNG Export
// ================================================================

/**
 * Fetch a URL and convert to base64 data URI.
 * Works for font files (woff2, woff, ttf, etc.)
 */
async function urlToDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Extract all URLs from @font-face CSS (including protocol-relative).
 */
function extractFontFileUrls(css: string): string[] {
  const urls: string[] = [];
  // Match url(https://...), url(//...), url(http://...)
  const regex = /url\(\s*['"]?(https?:\/\/[^'")\s]+|\/\/[^'")\s]+)['"]?\s*\)/g;
  let m;
  while ((m = regex.exec(css)) !== null) {
    let u = m[1];
    if (u.startsWith('//')) u = 'https:' + u;
    urls.push(u);
  }
  return [...new Set(urls)];
}

/**
 * Given a Google Fonts CSS URL, fetch the CSS, download all font files,
 * convert them to base64 data URIs, and return the CSS with embedded fonts.
 */
async function fetchAndEmbedFontCss(cssUrl: string): Promise<string> {
  try {
    const res = await fetch(cssUrl, {
      headers: {
        // Send a real browser User-Agent so Google returns woff2 format
        'User-Agent': navigator.userAgent,
      },
    });
    if (!res.ok) throw new Error(`CSS fetch failed: ${res.status}`);
    const css = await res.text();

    const fontUrls = extractFontFileUrls(css);
    if (fontUrls.length === 0) return css;

    let result = css;
    for (const fontUrl of fontUrls) {
      try {
        const dataUri = await urlToDataUri(fontUrl);
        result = result.split(fontUrl).join(dataUri);
      } catch {
        // Font file download failed — keep original URL
      }
    }
    return result;
  } catch {
    return '';
  }
}

/**
 * Get Google Fonts CSS URL for given font families (v2 API).
 */
function buildGoogleFontsCssUrl(families: string[]): string {
  const params = families.map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`).join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/**
 * Extract @import URLs from SVG <style> blocks.
 */
function extractImportUrls(svgCode: string): string[] {
  const urls: string[] = [];
  // Match both @import url('https://...') and @import url(https://...)
  const regex = /@import\s+url\(\s*['"]?(https?:\/\/[^'")\s]+)['"]?\s*\)/gi;
  let m;
  while ((m = regex.exec(svgCode)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

/**
 * Extract all font-family names from SVG (CSS + inline attributes).
 */
function extractFontFamilies(svgCode: string): string[] {
  const families = new Set<string>();
  const generic = new Set(['cursive', 'serif', 'sans-serif', 'monospace', 'system-ui', '-apple-system', 'Segoe UI']);

  // From CSS font-family declarations
  const cssRegex = /font-family\s*:\s*([^;}\n]+)/gi;
  let m;
  while ((m = cssRegex.exec(svgCode)) !== null) {
    m[1].split(',').forEach((f) => {
      const clean = f.trim().replace(/^['"]|['"]$/g, '');
      if (clean && !generic.has(clean.toLowerCase())) families.add(clean);
    });
  }

  // From inline font-family attributes
  const attrRegex = /font-family\s*=\s*"([^"]+)"/gi;
  while ((m = attrRegex.exec(svgCode)) !== null) {
    m[1].split(',').forEach((f) => {
      const clean = f.trim().replace(/^['"]|['"]$/g, '');
      if (clean && !generic.has(clean.toLowerCase())) families.add(clean);
    });
  }

  return Array.from(families);
}

/**
 * Embed all Google Fonts into SVG as base64 @font-face rules.
 * Replaces @import with inline @font-face + data URI font files.
 */
async function embedFontsInSvg(svgCode: string): Promise<string> {
  let result = svgCode;

  // Collect font URLs from @import statements
  const importUrls = extractImportUrls(svgCode);

  // Also detect font-family names for fonts not covered by @import
  const fontFamilies = extractFontFamilies(svgCode);

  // Track which fonts we've already fetched
  const fetchedFonts = new Set<string>();
  const cssParts: string[] = [];

  // Fetch CSS for @import URLs (embed fonts as base64)
  for (const url of importUrls) {
    const embeddedCss = await fetchAndEmbedFontCss(url);
    if (embeddedCss) {
      cssParts.push(embeddedCss);
      // Track font families from this CSS
      const famMatch = url.match(/family=([^&]+)/g);
      if (famMatch) famMatch.forEach((f) => fetchedFonts.add(f));
    }
  }

  // Fetch any remaining font families not in @import
  const remaining = fontFamilies.filter(
    (f) => !Array.from(fetchedFonts).some((u) => u.includes(f.replace(/\s+/g, '+')))
  );
  if (remaining.length > 0) {
    const extraUrl = buildGoogleFontsCssUrl(remaining);
    const embeddedCss = await fetchAndEmbedFontCss(extraUrl);
    if (embeddedCss) cssParts.push(embeddedCss);
  }

  if (cssParts.length === 0) return result;

  const combinedCss = cssParts.join('\n');

  // Remove @import lines from SVG
  result = result.replace(/@import\s+url\(\s*['"]?https?:\/\/[^'")\s]+['"]?\s*\)\s*;?\s*/gi, '');

  // Inject embedded @font-face CSS
  if (result.includes('<style>')) {
    result = result.replace('<style>', `<style>\n${combinedCss}\n`);
  } else if (result.includes('<defs>')) {
    result = result.replace('<defs>', `<defs>\n<style>${combinedCss}</style>\n`);
  } else {
    result = result.replace(/(<svg[^>]*>)/, `$1\n<defs><style>${combinedCss}</style></defs>`);
  }

  return result;
}

// ================================================================
// PNG Export — Uses font embedding + DOM rendering
// ================================================================

export function exportAsPng(svgCode: string, scale = 2): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (!svgCode || !svgCode.trim()) {
      reject(new Error('No SVG code provided'));
      return;
    }

    try {
      // STEP 1: Wait for all page fonts to be loaded
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // STEP 2: Embed Google Fonts as base64 in the SVG
      let processedSvg: string;
      try {
        processedSvg = await embedFontsInSvg(svgCode);
      } catch {
        processedSvg = svgCode;
      }

      // STEP 3: Parse dimensions
      const { width: baseW, height: baseH } = getSvgDimensions(processedSvg);

      // STEP 4: Ensure SVG has xmlns and dimensions
      let svgStr = processedSvg.trim();
      if (!svgStr.includes('xmlns=')) {
        svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // STEP 5: Create a hidden SVG element in the DOM
      // This ensures the browser processes the SVG with access to loaded fonts
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-99999px;top:-99999px;width:0;height:0;overflow:hidden;';
      document.body.appendChild(container);

      container.innerHTML = svgStr;

      const svgEl = container.querySelector('svg');
      if (!svgEl) {
        document.body.removeChild(container);
        reject(new Error('Invalid SVG'));
        return;
      }

      // Ensure SVG has explicit pixel dimensions for rendering
      svgEl.setAttribute('width', String(baseW));
      svgEl.setAttribute('height', String(baseH));

      // STEP 6: Wait a brief moment for fonts to apply
      await new Promise((r) => setTimeout(r, 100));

      // STEP 7: Serialize the SVG (now with fonts applied)
      const serializer = new XMLSerializer();
      const serializedSvg = serializer.serializeToString(svgEl);

      // Clean up DOM element
      document.body.removeChild(container);

      // STEP 8: Create Image from serialized SVG
      const img = new Image();
      const svgBlob = new Blob([serializedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvasW = Math.max(1, Math.round(baseW * scale));
        const canvasH = Math.max(1, Math.round(baseH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Canvas context not available'));
          return;
        }

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Scale and draw
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, baseW, baseH);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = pngUrl;
              a.download = `image-${scale}x-${canvasW}x${canvasH}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(pngUrl);
              resolve();
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
            URL.revokeObjectURL(blobUrl);
          },
          'image/png',
          1.0
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Failed to render SVG to image'));
      };

      img.src = blobUrl;
    } catch (err) {
      reject(err);
    }
  });
}
