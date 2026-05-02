/**
 * SVG Code Formatter / Pretty-Print
 * Properly indents SVG/XML code for readability and editing.
 * Works entirely client-side with no dependencies.
 */

export function formatSvgCode(svgCode: string): string {
  if (!svgCode || !svgCode.trim()) return svgCode;

  // First, normalize: remove extra whitespace between tags
  let code = svgCode
    .replace(/>\s+</g, '><')  // Remove whitespace between tags
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();

  // Parse and re-indent using a simple state machine
  const formatted = indentXml(code, '  ');
  return formatted;
}

function indentXml(xml: string, indent: string): string {
  let formatted = '';
  let level = 0;
  let i = 0;
  const len = xml.length;

  while (i < len) {
    // Skip whitespace
    if (xml[i] === ' ' || xml[i] === '\t' || xml[i] === '\n' || xml[i] === '\r') {
      i++;
      continue;
    }

    // Comment: <!-- ... -->
    if (xml.startsWith('<!--', i)) {
      const endIdx = xml.indexOf('-->', i);
      const comment = endIdx !== -1 ? xml.substring(i, endIdx + 3) : xml.substring(i);
      formatted += indent.repeat(level) + comment + '\n';
      i = endIdx !== -1 ? endIdx + 3 : len;
      continue;
    }

    // CDATA: <![CDATA[ ... ]]>
    if (xml.startsWith('<![CDATA[', i)) {
      const endIdx = xml.indexOf(']]>', i);
      const cdata = endIdx !== -1 ? xml.substring(i, endIdx + 3) : xml.substring(i);
      formatted += indent.repeat(level) + cdata + '\n';
      i = endIdx !== -1 ? endIdx + 3 : len;
      continue;
    }

    // Processing instruction: <?...?>
    if (xml.startsWith('<?', i)) {
      const endIdx = xml.indexOf('?>', i);
      const pi = endIdx !== -1 ? xml.substring(i, endIdx + 2) : xml.substring(i);
      formatted += pi + '\n';
      i = endIdx !== -1 ? endIdx + 2 : len;
      continue;
    }

    // DOCTYPE: <!DOCTYPE ...>
    if (xml.startsWith('<!DOCTYPE', i) || xml.startsWith('<!doctype', i)) {
      const endIdx = xml.indexOf('>', i);
      const dt = endIdx !== -1 ? xml.substring(i, endIdx + 1) : xml.substring(i);
      formatted += dt + '\n';
      i = endIdx !== -1 ? endIdx + 1 : len;
      continue;
    }

    // Closing tag: </tagname>
    if (xml.startsWith('</', i)) {
      level = Math.max(0, level - 1);
      const endIdx = xml.indexOf('>', i);
      const tag = endIdx !== -1 ? xml.substring(i, endIdx + 1) : xml.substring(i);
      formatted += indent.repeat(level) + tag + '\n';
      i = endIdx !== -1 ? endIdx + 1 : len;
      continue;
    }

    // Opening or self-closing tag: <tagname ...> or <tagname ... />
    if (xml[i] === '<') {
      const tagContent = extractTag(xml, i);
      if (!tagContent) {
        // Fallback: just copy character
        formatted += xml[i];
        i++;
        continue;
      }

      const { fullTag, isSelfClosing, isClosing } = tagContent;

      if (isClosing) {
        // This is actually a closing tag like </...>
        level = Math.max(0, level - 1);
        formatted += indent.repeat(level) + fullTag + '\n';
      } else if (isSelfClosing) {
        // Self-closing tag like <br/> or <path d="..."/>
        formatted += indent.repeat(level) + fullTag + '\n';
      } else {
        // Opening tag <svg ...>
        formatted += indent.repeat(level) + fullTag + '\n';
        level++;
      }

      i += fullTag.length;
      continue;
    }

    // Text content between tags
    const textEnd = xml.indexOf('<', i);
    const text = (textEnd !== -1 ? xml.substring(i, textEnd) : xml.substring(i)).trim();
    if (text) {
      // If text is short, keep on same line; if long, indent
      if (text.length < 120) {
        formatted += indent.repeat(level) + text + '\n';
      } else {
        // Break long text into chunks
        const words = text.split(/\s+/);
        let line = indent.repeat(level);
        for (const word of words) {
          if (line.length + word.length + 1 > 100 && line.length > indent.repeat(level).length) {
            formatted += line + '\n';
            line = indent.repeat(level) + word;
          } else {
            line += (line.endsWith(indent.repeat(level)) ? '' : ' ') + word;
          }
        }
        if (line.trim()) formatted += line + '\n';
      }
    }

    i = textEnd !== -1 ? textEnd : len;
  }

  // Clean up: remove trailing whitespace on lines, ensure single newline at end
  return formatted
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, idx, arr) => {
      // Remove consecutive blank lines (keep max 1)
      if (line === '' && idx > 0 && arr[idx - 1] === '') return false;
      return true;
    })
    .join('\n')
    .trim() + '\n';
}

interface TagInfo {
  fullTag: string;
  tagName: string;
  isSelfClosing: boolean;
  isClosing: boolean;
}

function extractTag(xml: string, start: number): TagInfo | null {
  const len = xml.length;
  if (xml[start] !== '<') return null;

  // Find the closing >
  let inQuote = false;
  let quoteChar = '';
  let end = start + 1;

  while (end < len) {
    const ch = xml[end];
    if (inQuote) {
      if (ch === quoteChar) inQuote = false;
    } else {
      if (ch === '"' || ch === "'") {
        inQuote = true;
        quoteChar = ch;
      } else if (ch === '>') {
        break;
      }
    }
    end++;
  }

  if (end >= len) return null;
  const fullTag = xml.substring(start, end + 1);

  // Extract tag name
  const isClosing = fullTag.startsWith('</');
  const isSelfClosing = fullTag.endsWith('/>') || isClosing;
  const tagStart = isClosing ? 2 : 1;
  const nameEndMatch = fullTag.substring(tagStart).match(/[\s/>]/);
  const tagName = nameEndMatch
    ? fullTag.substring(tagStart, tagStart + nameEndMatch.index!)
    : fullTag.substring(tagStart, fullTag.length - (isSelfClosing ? 2 : 1));

  // Void elements are always self-closing in practice
  const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  const isVoid = voidElements.includes(tagName.toLowerCase());

  return {
    fullTag,
    tagName,
    isSelfClosing: isSelfClosing || isVoid || isClosing,
    isClosing,
  };
}

/**
 * Quick check: is the code already formatted?
 * Returns true if code has proper indentation (multiple lines with leading spaces)
 */
export function isFormatted(code: string): boolean {
  const lines = code.split('\n');
  if (lines.length < 3) return false;
  // Check if at least 30% of non-empty lines have indentation
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  const indented = nonEmpty.filter((l) => l.startsWith('  ') || l.startsWith('\t'));
  return indented.length / nonEmpty.length > 0.3;
}
