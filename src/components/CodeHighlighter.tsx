import { useMemo, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';

interface CodeHighlighterProps {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

/* ========================================================
   VS Code+ Multi-Color Syntax Highlighter
   Supports: SVG, JSX, TSX, JavaScript, HTML, CSS
   ======================================================== */

function tokenizeAndHighlight(code: string): string {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  let result = escaped;

  // --- Multi-pass tokenization (order matters!) ---

  // 1. Multi-line comments: /* ... */ and <!-- ... -->
  result = result.replace(
    /(\/\*[\s\S]*?\*\/|&lt;!--[\s\S]*?--&gt;|\/\/[^\n]*)/g,
    '<span class="syn-comment">$1</span>'
  );

  // 2. Strings: double-quoted, single-quoted, template literals
  result = result.replace(
    /(&quot;(?:[^&]|&amp;|&quot;)*?&quot;|&#39;(?:[^&]|&amp;|&#39;)*?&#39;|`[\s\S]*?`)/g,
    '<span class="syn-string">$1</span>'
  );

  // 3. JSX / Component tags (capitalized)
  result = result.replace(
    /(&lt;\/?)([A-Z][\w.]*)/g,
    '$1<span class="syn-component">$2</span>'
  );

  // 4. Regular tags (lowercase)
  result = result.replace(
    /(&lt;\/?)([\w\-:]+)/g,
    '$1<span class="syn-tag">$2</span>'
  );

  // 5. Attribute names (word=)
  result = result.replace(
    /\b([a-zA-Z_\-:][\w\-:]*)(&quot;|&#39;|=)/g,
    '<span class="syn-attr-name">$1</span>$2'
  );

  // 6. Keywords: import, export, const, let, var, function, return, if, else, default, from
  result = result.replace(
    /\b(import|export|from|default|const|let|var|function|return|if|else|for|while|class|extends|new|this|typeof|instanceof|interface|type|as|in|of|async|await|void|null|undefined|true|false)\b/g,
    '<span class="syn-keyword">$1</span>'
  );

  // 7. React keywords
  result = result.replace(
    /\b(React|useState|useEffect|useRef|useMemo|useCallback|useContext)\b/g,
    '<span class="syn-react-keyword">$1</span>'
  );

  // 8. Numbers
  result = result.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="syn-number">$1</span>'
  );

  // 9. Template string placeholders ${...}
  result = result.replace(
    /(\$\{)/g,
    '<span class="syn-punctuation">$1</span>'
  );

  // 10. Brackets and punctuation
  result = result.replace(
    /(&lt;\/?|\/?&gt;|=&gt;|===|!==|[{}()\[\];])/g,
    '<span class="syn-bracket">$1</span>'
  );

  // 11. Operators
  result = result.replace(
    /([=+\-*/&lt;&gt;!&amp;|?~%^:,.])/g,
    '<span class="syn-operator">$1</span>'
  );

  // 12. HTML/XML entities
  result = result.replace(
    /(&amp;[\w#]+;)/g,
    '<span class="syn-entity">$1</span>'
  );

  return result;
}

/* ========================================================
   Component
   ======================================================== */

export function CodeHighlighter({ code, onChange, readOnly = false, placeholder }: CodeHighlighterProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlighted = useMemo(() => tokenizeAndHighlight(code), [code]);

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

  // Language detection
  const langLabel = useMemo(() => {
    const trimmed = code.trimStart();
    if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml') || trimmed.startsWith('<!DOCTYPE')) return 'SVG';
    if (trimmed.startsWith('import') || trimmed.includes('React') || trimmed.includes('function')) {
      if (trimmed.includes(':') && trimmed.includes('interface') || trimmed.includes('type ')) return 'TypeScript';
      return 'JSX';
    }
    if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html')) return 'HTML';
    return 'Code';
  }, [code]);

  return (
    <div className="relative flex-1 rounded-xl overflow-hidden border border-gray-700 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500/50 shadow-lg">
      {/* Top bar — language indicator + line count */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          {/* VS Code-like window dots */}
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] inline-block" />
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          {langLabel} · {lines.length} line{lines.length !== 1 ? 's' : ''} · {code.length} chars
        </span>
      </div>

      <div className="relative" style={{ backgroundColor: '#1e1e1e' }}>
        {/* Line numbers */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none overflow-hidden font-mono text-[13px] leading-[21px] py-2 text-right pr-3 select-none"
          style={{ backgroundColor: '#1e1e1e', borderRight: '1px solid #2d2d2d' }}
        >
          {lines.map((_, i) => (
            <div key={i} style={{ color: '#858585' }}>{i + 1}</div>
          ))}
        </div>

        {/* Highlighted code layer */}
        <pre
          ref={preRef}
          className="absolute inset-0 overflow-hidden pointer-events-none font-mono text-[13px] leading-[21px] p-2 m-0 whitespace-pre tab-size-2"
          style={{ paddingLeft: '3.5rem', color: '#d4d4d4', backgroundColor: 'transparent' }}
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
          className="relative z-20 w-full h-full min-h-[400px] font-mono text-[13px] leading-[21px] bg-transparent text-transparent caret-white resize-none focus:outline-none m-0"
          style={{ padding: '0.5rem', paddingLeft: '3.5rem', tabSize: 2 }}
          placeholder={placeholder}
        />

        {/* Placeholder */}
        {code.length === 0 && placeholder && !readOnly && (
          <div
            className="absolute pointer-events-none z-0 font-mono text-[13px] text-gray-500"
            style={{ left: '3.5rem', top: '0.5rem' }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
