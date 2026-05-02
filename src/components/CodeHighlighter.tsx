import { useMemo, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';

interface CodeHighlighterProps {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

// ================================================================
// Line-by-line regex highlighter
// Every character is GUARANTEED to end up inside a <span>.
// This approach never breaks even when code is malformed.
// ================================================================

function escapeHtml(ch: string): string {
  switch (ch) {
    case '&': return '&amp;';
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '"': return '&quot;';
    case "'": return '&#39;';
    default: return ch;
  }
}

function escapeStr(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) out += escapeHtml(s[i]);
  return out;
}

function span(cls: string, text: string): string {
  return `<span class="${cls}">${escapeStr(text)}</span>`;
}

// Highlight a single line — each regex consumes characters so nothing is left bare
function highlightLine(line: string): string {
  let result = '';
  let i = 0;
  const len = line.length;

  while (i < len) {
    // 1) Comment: <!-- ... --> (may span multiple lines, but handle start/end)
    if (line.substring(i, i + 4) === '<!--') {
      const end = line.indexOf('-->', i + 4);
      if (end !== -1) {
        result += span('syn-comment', line.substring(i, end + 3));
        i = end + 3;
      } else {
        // Comment continues to next line
        result += span('syn-comment', line.substring(i));
        i = len;
      }
      continue;
    }

    // 2) Processing instruction: <? ... ?>
    if (line.substring(i, i + 2) === '<?') {
      const end = line.indexOf('?>', i + 2);
      if (end !== -1) {
        result += span('syn-keyword', line.substring(i, end + 2));
        i = end + 2;
      } else {
        result += span('syn-keyword', line.substring(i));
        i = len;
      }
      continue;
    }

    // 3) CDATA
    if (line.substring(i, i + 9) === '<![CDATA[') {
      const end = line.indexOf(']]>', i + 9);
      if (end !== -1) {
        result += span('syn-entity', line.substring(i, end + 3));
        i = end + 3;
      } else {
        result += span('syn-entity', line.substring(i));
        i = len;
      }
      continue;
    }

    // 4) DOCTYPE
    if (line.substring(i, i + 9).toUpperCase() === '<!DOCTYPE') {
      const end = line.indexOf('>', i);
      if (end !== -1) {
        result += span('syn-comment', line.substring(i, end + 1));
        i = end + 1;
      } else {
        result += span('syn-comment', line.substring(i));
        i = len;
      }
      continue;
    }

    // 5) Opening/Closing/Self-closing tag
    if (line[i] === '<') {
      result += highlightTag(line, i, (newI) => { i = newI; });
      continue;
    }

    // 6) Entity reference: &amp; &#123; &nbsp;
    if (line[i] === '&') {
      const m = line.substring(i).match(/^&(#\d+|#x[\da-fA-F]+|[a-zA-Z]+);/);
      if (m) {
        result += span('syn-entity', m[0]);
        i += m[0].length;
        continue;
      }
    }

    // 7) Number (with optional unit)
    {
      const m = line.substring(i).match(/^\d+\.?\d*(px|em|rem|%|deg|vh|vw|cm|mm|in|pt)?/);
      if (m && m[0].length > 0) {
        result += span('syn-number', m[0]);
        i += m[0].length;
        continue;
      }
    }

    // 8) Whitespace run
    if (line[i] === ' ' || line[i] === '\t') {
      let end = i;
      while (end < len && (line[end] === ' ' || line[end] === '\t')) end++;
      result += span('syn-text', line.substring(i, end));
      i = end;
      continue;
    }

    // 9) Any other character — wrap in default color
    result += span('syn-text', line[i]);
    i++;
  }

  return result;
}

// Highlight a tag starting at position `start` in line
// Returns the highlighted HTML and updates position via callback
function highlightTag(line: string, start: number, setI: (n: number) => void): string {
  let result = '';
  let i = start;
  const len = line.length;

  // Opening bracket
  if (i + 1 < len && line[i + 1] === '/') {
    result += span('syn-bracket', '</');
    i += 2;
  } else {
    result += span('syn-bracket', '<');
    i += 1;
  }

  // Tag name
  let nameEnd = i;
  while (nameEnd < len && /[\w\-:.]/.test(line[nameEnd])) nameEnd++;
  if (nameEnd > i) {
    const tagName = line.substring(i, nameEnd);
    const cls = getTagClass(tagName);
    result += span(cls, tagName);
    i = nameEnd;
  }

  // Attributes, whitespace, closing
  while (i < len) {
    // Self-closing: />
    if (line[i] === '/' && i + 1 < len && line[i + 1] === '>') {
      result += span('syn-bracket', '/>');
      setI(i + 2);
      return result;
    }

    // Closing: >
    if (line[i] === '>') {
      result += span('syn-bracket', '>');
      setI(i + 1);
      return result;
    }

    // Whitespace
    if (line[i] === ' ' || line[i] === '\t' || line[i] === '\n') {
      let end = i;
      while (end < len && (line[end] === ' ' || line[end] === '\t' || line[end] === '\n')) end++;
      result += span('syn-text', line.substring(i, end));
      i = end;
      continue;
    }

    // Attribute name
    const attrM = line.substring(i).match(/^[a-zA-Z_][\w\-:.]*/);
    if (attrM) {
      result += span('syn-attr-name', attrM[0]);
      i += attrM[0].length;
      continue;
    }

    // Equals sign
    if (line[i] === '=') {
      result += span('syn-bracket', '=');
      i += 1;
      continue;
    }

    // Double-quoted string
    if (line[i] === '"') {
      let end = i + 1;
      while (end < len && line[end] !== '"') end++;
      if (end < len) end++; // closing quote
      result += span('syn-string', line.substring(i, end));
      i = end;
      continue;
    }

    // Single-quoted string
    if (line[i] === "'") {
      let end = i + 1;
      while (end < len && line[end] !== "'") end++;
      if (end < len) end++;
      result += span('syn-string', line.substring(i, end));
      i = end;
      continue;
    }

    // Unknown char inside tag
    result += span('syn-text', line[i]);
    i++;
  }

  // Reached end of line without closing >
  setI(i);
  return result;
}

function getTagClass(name: string): string {
  const shapes = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'];
  const containers = ['svg', 'g', 'defs', 'symbol', 'use', 'clipPath', 'mask', 'pattern', 'a', 'switch', 'foreignObject'];
  const gradients = ['linearGradient', 'radialGradient', 'stop'];
  const textTags = ['text', 'tspan', 'textPath'];
  const filters = ['filter', 'feTurbulence', 'feComponentTransfer', 'feFuncR', 'feFuncG', 'feFuncB', 'feFuncA', 'feBlend', 'feDropShadow', 'feGaussianBlur', 'feColorMatrix', 'feOffset', 'feMerge', 'feMergeNode', 'feFlood', 'feImage', 'feComposite', 'feMorphology', 'feDiffuseLighting', 'feSpecularLighting', 'fePointLight', 'feSpotLight', 'feDistantLight', 'feTile'];

  if (shapes.includes(name)) return 'syn-shape-tag';
  if (containers.includes(name)) return 'syn-container-tag';
  if (gradients.includes(name)) return 'syn-gradient-tag';
  if (textTags.includes(name)) return 'syn-text-tag';
  if (filters.includes(name)) return 'syn-filter-tag';
  return 'syn-tag';
}

function highlightFullCode(code: string): string {
  if (!code) return '';
  const lines = code.split('\n');
  return lines.map((line) => highlightLine(line) || '<span class="syn-text"> </span>').join('\n');
}

// ================================================================
// Component
// ================================================================

export function CodeHighlighter({ code, onChange, readOnly = false, placeholder }: CodeHighlighterProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlighted = useMemo(() => highlightFullCode(code), [code]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        const newVal = val.substring(0, start) + '  ' + val.substring(end);
        onChange?.(newVal);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
    },
    [onChange]
  );

  const handleScroll = useCallback(() => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      // Also sync line numbers
      const lineNumEl = preRef.current.parentElement?.querySelector('.code-line-nums') as HTMLElement;
      if (lineNumEl) {
        lineNumEl.scrollTop = textareaRef.current.scrollTop;
      }
    }
  }, []);

  return (
    <div
      className="code-editor-wrap relative flex-1 rounded-xl overflow-hidden border border-gray-700 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500/50"
      style={{ backgroundColor: '#1e1e1e' }}
    >
      {/* Line numbers — separate scrollable div synced with textarea */}
      <div
        className="code-line-nums absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none overflow-hidden font-mono text-sm leading-[1.625] py-4 text-right pr-3 select-none"
        style={{ color: '#6e6e6e', backgroundColor: '#1e1e1e', borderRight: '1px solid #333' }}
      >
        {lines.map((_, i) => (
          <div key={i} className="px-1">{i + 1}</div>
        ))}
      </div>

      {/* Highlighted code layer — behind textarea, pointer-events none */}
      <pre
        ref={preRef}
        className="absolute inset-0 overflow-hidden pointer-events-none font-mono text-sm leading-[1.625] p-4 m-0 whitespace-pre-wrap break-all"
        style={{ paddingLeft: '3.75rem', color: '#d4d4d4', background: 'transparent', wordBreak: 'break-all' }}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
      />

      {/* Textarea — transparent text, visible caret & selection */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        readOnly={readOnly}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="relative z-20 w-full h-full min-h-[400px] font-mono text-sm leading-[1.625] resize-none focus:outline-none m-0"
        style={{
          padding: '1rem',
          paddingLeft: '3.75rem',
          tabSize: 2,
          backgroundColor: 'transparent',
          color: 'transparent',
          caretColor: '#d4d4d4',
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
        }}
        placeholder={placeholder}
      />

      {/* Placeholder when empty */}
      {code.length === 0 && placeholder && !readOnly && (
        <div
          className="absolute pointer-events-none z-0 font-mono text-sm"
          style={{ left: '3.75rem', top: '1rem', color: '#6e6e6e' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
