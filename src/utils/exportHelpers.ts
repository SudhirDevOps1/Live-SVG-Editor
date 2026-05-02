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

/**
 * Parse SVG dimensions from code (supports viewBox, width, height attributes)
 */
function parseSvgDimensions(svgCode: string): { w: number; h: number } {
  let w = 800;
  let h = 600;

  // Try to get viewBox
  const viewBoxMatch = svgCode.match(/viewBox\s*=\s*"?\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/);
  if (viewBoxMatch) {
    w = parseFloat(viewBoxMatch[1]);
    h = parseFloat(viewBoxMatch[2]);
    return { w, h };
  }

  // Try to get width and height
  const widthMatch = svgCode.match(/width\s*=\s*"?\s*([\d.]+)/);
  const heightMatch = svgCode.match(/height\s*=\s*"?\s*([\d.]+)/);
  if (widthMatch) w = parseFloat(widthMatch[1]);
  if (heightMatch) h = parseFloat(heightMatch[1]);

  return { w, h };
}

/**
 * Export SVG as PNG at given scale multiplier (1x, 2x, 3x, 4x)
 */
export function exportAsPng(svgCode: string, scale = 2): Promise<void> {
  return new Promise((resolve, reject) => {
    // Wrap SVG with XML declaration and proper namespace for better compatibility
    let svgStr = svgCode;
    if (!svgStr.includes('<?xml')) {
      svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgStr;
    }
    if (!svgStr.includes('xmlns')) {
      svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const { w, h } = parseSvgDimensions(svgStr);

    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Use the larger of: natural size or parsed dimensions
      const imgW = img.naturalWidth || w;
      const imgH = img.naturalHeight || h;

      const canvasWidth = imgW * scale;
      const canvasHeight = imgH * scale;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context not available'));
        return;
      }

      // White background for transparent SVGs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Scale and draw
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, imgW, imgH);

      // Export as PNG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `image-${scale}x.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(url);
            resolve();
          } else {
            URL.revokeObjectURL(url);
            reject(new Error('PNG export failed'));
          }
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image loading failed'));
    };

    // Use encoded data URI for better browser compatibility
    img.src = url;
  });
}
