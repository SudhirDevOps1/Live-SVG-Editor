export function optimizeSvg(svgCode: string): string {
  let result = svgCode;

  // Remove XML comments
  result = result.replace(/<!--[\s\S]*?-->/g, '');

  // Remove metadata blocks
  result = result.replace(/<metadata[\s\S]*?<\/metadata>\s*/gi, '');

  // Remove XML declaration
  result = result.replace(/<\?xml[^?]*\?>\s*/g, '');

  // Remove DOCTYPE
  result = result.replace(/<!DOCTYPE[^>]*>\s*/g, '');

  // Remove empty groups (run multiple times for nested)
  for (let i = 0; i < 5; i++) {
    result = result.replace(/<g[^>]*>\s*<\/g>/gi, '');
  }

  // Remove empty defs
  result = result.replace(/<defs[^>]*>\s*<\/defs>/gi, '');

  // Remove redundant whitespace
  result = result.replace(/>\s+</g, '><');
  result = result.replace(/\s{2,}/g, ' ');

  return result.trim();
}
