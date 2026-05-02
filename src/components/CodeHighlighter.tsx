import { useMemo, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';

interface CodeHighlighterProps {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

function highlightSvgCode(code: string): string {
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Step 1: Comments: <!-- ... -->
  escaped = escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="syn-comment">$1</span>'
  );

  // Step 2: Strings (attribute values) — double-quoted
  escaped = escaped.replace(
    /(&quot;)(.*?)(&quot;)/g,
    '<span class="syn-string">&quot;$2&quot;</span>'
  );

  // Step 3: Known SVG keywords/attributes get special highlighting
  const svgKeywords = [
    'xmlns', 'viewBox', 'preserveAspectRatio', 'version',
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-opacity', 'fill-opacity',
    'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height',
    'd', 'points', 'transform', 'opacity', 'clip-path', 'mask',
    'font-size', 'font-family', 'font-weight', 'text-anchor', 'dominant-baseline', 'letter-spacing',
    'offset', 'stop-color', 'stop-opacity',
    'gradientUnits', 'spreadMethod', 'gradientTransform',
    'patternUnits', 'patternTransform',
    'filter', 'filterUnits', 'primitiveUnits',
    'id', 'class', 'style', 'href', 'xlink:href', 'target', 'rel',
  ];

  // Step 4: Attribute names (word followed by =)
  escaped = escaped.replace(
    /\b([a-zA-Z\-:]+)(=)/g,
    (_match, attrName: string, eq: string) => {
      const isSvgAttr = svgKeywords.includes(attrName);
      const cls = isSvgAttr ? 'syn-attr-name syn-attr-svg' : 'syn-attr-name';
      return `<span class="${cls}">${attrName}</span>${eq}`;
    }
  );

  // Step 5: SVG tags get special colors
  const shapeTags = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'];
  const containerTags = ['svg', 'g', 'defs', 'symbol', 'use', 'clipPath', 'mask', 'pattern'];
  const gradientTags = ['linearGradient', 'radialGradient', 'stop'];
  const textTags = ['text', 'tspan', 'textPath'];

  escaped = escaped.replace(
    /(&lt;\/?)([\w\-:]+)/g,
    (_match: string, bracket: string, tag: string) => {
      let cls = 'syn-tag';
      if (shapeTags.includes(tag)) cls = 'syn-shape-tag';
      else if (containerTags.includes(tag)) cls = 'syn-container-tag';
      else if (gradientTags.includes(tag)) cls = 'syn-gradient-tag';
      else if (textTags.includes(tag)) cls = 'syn-text-tag';
      return `${bracket}<span class="${cls}">${tag}</span>`;
    }
  );

  // Step 6: Brackets
  escaped = escaped.replace(
    /(&lt;\/?|\/?&gt;)/g,
    '<span class="syn-bracket">$1</span>'
  );

  // Step 7: Numbers with units (like 10px, 50%, 0.5)
  escaped = escaped.replace(
    /\b(\d+\.?\d*)(px|em|rem|%|deg|rad|grad|turn|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?\b/g,
    '<span class="syn-number">$1$2</span>'
  );

  // Step 8: Entities: &amp;...;
  escaped = escaped.replace(
    /(&amp;[\w#]+;)/g,
    '<span class="syn-entity">$1</span>'
  );

  // Step 9: CSS color names in strings
  const cssColors = ['white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'gray', 'grey'];
  cssColors.forEach((color) => {
    const re = new RegExp(`\\b(${color})\\b`, 'gi');
    escaped = escaped.replace(re, '<span class="syn-color">$1</span>');
  });

  return escaped;
}

export function CodeHighlighter({ code, onChange, readOnly = false, placeholder }: CodeHighlighterProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlighted = useMemo(() => highlightSvgCode(code), [code]);

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
    }
  }, []);

  return (
    <div className="relative flex-1 rounded-xl overflow-hidden border border-gray-700 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500/50" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Line numbers */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none overflow-hidden font-mono text-sm leading-[1.625] py-4 text-right pr-4 border-r border-gray-700/50"
        style={{ color: '#858585' }}
      >
        {lines.map((_, i) => (
          <div key={i} className="px-1">{i + 1}</div>
        ))}
      </div>

      {/* Highlighted code layer */}
      <pre
        ref={preRef}
        className="absolute inset-0 overflow-hidden pointer-events-none font-mono text-sm leading-[1.625] p-4 m-0 whitespace-pre tab-size-2"
        style={{ paddingLeft: '3.75rem', color: '#d4d4d4' }}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
      />

      {/* Actual textarea (transparent text, visible caret) */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        readOnly={readOnly}
        spellCheck={false}
        className="relative z-20 w-full h-full min-h-[400px] font-mono text-sm leading-[1.625] bg-transparent text-transparent caret-white resize-none focus:outline-none m-0"
        style={{ padding: '1rem', paddingLeft: '3.75rem', tabSize: 2 }}
        placeholder={placeholder}
      />

      {/* Placeholder */}
      {code.length === 0 && placeholder && !readOnly && (
        <div className="absolute pointer-events-none z-0 font-mono text-sm text-gray-500" style={{ left: '3.75rem', top: '1rem' }}>
          {placeholder}
        </div>
      )}
    </div>
  );
}
