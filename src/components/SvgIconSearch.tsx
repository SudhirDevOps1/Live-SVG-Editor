import { useState, useCallback, useRef, useEffect } from 'react';

interface SvgIconSearchProps {
  onInsertSvg: (svgCode: string) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface IconResult {
  id: string;
  collection: string;
  name: string;
  set: string;
  source: string;
}

// ============================================================
// API Layer — tries multiple free APIs with fallback
// ============================================================

// API 1: Iconify (200,000+ icons, no key)
async function searchIconify(query: string, signal?: AbortSignal): Promise<IconResult[]> {
  const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=40`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Iconify: ${res.status}`);
  const data = await res.json();
  if (!data.icons || !Array.isArray(data.icons) || data.icons.length === 0) return [];
  return data.icons.map((iconStr: string) => {
    const parts = iconStr.split(':');
    return {
      id: iconStr,
      collection: parts[0],
      name: parts.length > 1 ? parts[1] : parts[0],
      set: getSetLabel(parts[0]),
      source: 'iconify',
    };
  });
}

// API 2: theSVG (5,650+ brand icons, no key)
async function searchTheSvg(query: string, signal?: AbortSignal): Promise<IconResult[]> {
  const url = `https://thesvg.org/api/icons?q=${encodeURIComponent(query)}&limit=30`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`theSVG: ${res.status}`);
  const data = await res.json();
  // theSVG returns an array of icon objects
  const icons = Array.isArray(data) ? data : data.icons || data.data || [];
  if (icons.length === 0) return [];
  return icons.map((item: { slug?: string; name?: string; title?: string; id?: string }) => {
    const slug = item.slug || item.name || item.id || '';
    return {
      id: `thesvg:${slug}`,
      collection: 'thesvg',
      name: slug,
      set: 'Brand Icons (theSVG)',
      source: 'thesvg',
    };
  });
}

// API 3: Simple Icons — direct CDN (1,500+ brand icons, no key, no search API)
// We use a local filter approach
const SIMPLE_ICONS_BRANDS = [
  'github', 'google', 'facebook', 'twitter', 'instagram', 'youtube', 'linkedin',
  'amazon', 'apple', 'microsoft', 'netflix', 'spotify', 'slack', 'discord', 'twitch',
  'reddit', 'pinterest', 'snapchat', 'tiktok', 'whatsapp', 'telegram', 'signal',
  'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'dribbble', 'behance',
  'vue', 'react', 'angular', 'svelte', 'nextjs', 'nuxtjs', 'nodejs', 'deno', 'bun',
  'typescript', 'javascript', 'python', 'rust', 'go', 'java', 'php', 'ruby', 'swift',
  'docker', 'kubernetes', 'aws', 'azure', 'firebase', 'supabase', 'vercel', 'netlify',
  'gitlab', 'bitbucket', 'npm', 'yarn', 'webpack', 'vite', 'tailwindcss', 'bootstrap',
  'stripe', 'paypal', 'visa', 'mastercard', 'bitcoin', 'ethereum', 'solana',
  'firefox', 'chrome', 'safari', 'opera', 'brave',
  'uber', 'airbnb', 'tesla', 'nike', 'adidas',
  'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
  'docker', 'nginx', 'apache', 'cloudflare', 'digitalocean',
];

async function searchSimpleIcons(query: string, signal?: AbortSignal): Promise<IconResult[]> {
  const q = query.toLowerCase().trim();
  const matches = SIMPLE_ICONS_BRANDS.filter((b) => b.includes(q) || q.includes(b));
  if (matches.length === 0) return [];
  // Validate first result with a HEAD request
  try {
    const testUrl = `https://cdn.simpleicons.org/${matches[0]}`;
    const res = await fetch(testUrl, { method: 'HEAD', signal });
    if (!res.ok) throw new Error('Simple Icons CDN not available');
  } catch {
    throw new Error('Simple Icons: CDN not reachable');
  }
  return matches.slice(0, 20).map((slug) => ({
    id: `simpleicons:${slug}`,
    collection: 'simpleicons',
    name: slug,
    set: 'Simple Icons (Brands)',
    source: 'simpleicons',
  }));
}

// ============================================================
// Get human-readable collection labels
// ============================================================

function getSetLabel(prefix: string): string {
  const map: Record<string, string> = {
    mdi: 'Material Design Icons',
    'mdi-light': 'Material Light',
    lucide: 'Lucide',
    heroicons: 'Heroicons',
    'heroicons-outline': 'Heroicons Outline',
    'heroicons-solid': 'Heroicons Solid',
    tabler: 'Tabler Icons',
    ph: 'Phosphor',
    carbon: 'Carbon',
    fluent: 'Fluent UI',
    'fluent-emoji': 'Fluent Emoji',
    ic: 'Google Material',
    bi: 'Bootstrap Icons',
    ri: 'Remix Icons',
    'fa6-solid': 'Font Awesome Solid',
    'fa6-regular': 'Font Awesome Regular',
    'fa6-brands': 'Font Awesome Brands',
    'fa-solid': 'FA5 Solid',
    'fa-regular': 'FA5 Regular',
    'fa-brands': 'FA5 Brands',
    bx: 'BoxIcons',
    bxl: 'BoxIcons Logos',
    'ant-design': 'Ant Design',
    'ci': 'Circum Icons',
    'eos-icons': 'EOS Icons',
    'flowbite': 'Flowbite',
    'gridicons': 'Gridicons',
    'iconoir': 'Iconoir',
    'ion': 'Ionicons',
    'majesticons': 'Majesticons',
    'mingcute': 'MingCute',
    'octicon': 'GitHub Octicons',
    'pepicons': 'Pepicons',
    'pixelarticons': 'Pixelart Icons',
    'radix-icons': 'Radix Icons',
    'system-uicons': 'System UIcons',
    'uim': 'Unicons Mono',
    'uis': 'Unicons Solid',
    'uit': 'Unicons Thin',
    'uil': 'Unicons Line',
    'vaadin': 'Vaadin Icons',
    'zondicons': 'Zondicons',
  };
  return map[prefix] || prefix;
}

// ============================================================
// Fallback search — tries all APIs in sequence
// ============================================================

async function searchWithFallback(query: string, signal?: AbortSignal): Promise<{ results: IconResult[]; source: string }> {
  // Try API 1: Iconify
  try {
    const results = await searchIconify(query, signal);
    if (results.length > 0) return { results, source: 'Iconify' };
  } catch { /* continue to next */ }

  // Try API 2: theSVG
  try {
    const results = await searchTheSvg(query, signal);
    if (results.length > 0) return { results, source: 'theSVG' };
  } catch { /* continue to next */ }

  // Try API 3: Simple Icons (brand filter)
  try {
    const results = await searchSimpleIcons(query, signal);
    if (results.length > 0) return { results, source: 'Simple Icons' };
  } catch { /* continue to next */ }

  return { results: [], source: 'none' };
}

// ============================================================
// Fetch actual SVG for an icon
// ============================================================

async function fetchIconSvg(icon: IconResult): Promise<string> {
  let url = '';
  switch (icon.source) {
    case 'iconify':
      url = `https://api.iconify.design/${icon.collection}/${icon.name}.svg`;
      break;
    case 'thesvg':
      // theSVG serves SVGs at /icons/{slug}/{variant}.svg
      url = `https://thesvg.org/icons/${icon.name}/default.svg`;
      break;
    case 'simpleicons':
      url = `https://cdn.simpleicons.org/${icon.name}`;
      break;
    default:
      url = `https://api.iconify.design/${icon.collection}/${icon.name}.svg`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`);
  let svg = await res.text();
  // Ensure xmlns is present
  if (svg.includes('<svg') && !svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return svg;
}

// ============================================================
// Get thumbnail URL for an icon
// ============================================================

function getThumbUrl(icon: IconResult): string {
  switch (icon.source) {
    case 'iconify':
      return `https://api.iconify.design/${icon.collection}/${icon.name}.svg`;
    case 'thesvg':
      return `https://thesvg.org/icons/${icon.name}/default.svg`;
    case 'simpleicons':
      return `https://cdn.simpleicons.org/${icon.name}`;
    default:
      return `https://api.iconify.design/${icon.collection}/${icon.name}.svg`;
  }
}

// ============================================================
// Main Component
// ============================================================

const QUICK_SEARCHES = [
  'home', 'heart', 'star', 'user', 'settings', 'search',
  'arrow', 'close', 'menu', 'check', 'plus', 'minus',
  'edit', 'delete', 'download', 'upload', 'share', 'lock',
  'bell', 'camera', 'cloud', 'code', 'copy', 'eye',
];

export function SvgIconSearch({ onInsertSvg, addToast, isOpen, onClose }: SvgIconSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IconResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [previewIcon, setPreviewIcon] = useState<IconResult | null>(null);
  const [previewSvg, setPreviewSvg] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [iconColor, setIconColor] = useState('#6366f1');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('icon-search-history');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const saveHistory = useCallback((term: string) => {
    setSearchHistory((prev) => {
      const next = [term, ...prev.filter((h) => h !== term)].slice(0, 12);
      try { localStorage.setItem('icon-search-history', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError('');
    setDataSource('');
    saveHistory(q.trim());

    try {
      const { results: res, source } = await searchWithFallback(q.trim(), abortRef.current.signal);
      setResults(res);
      setDataSource(source);
      if (res.length === 0) {
        setError(`No icons found for "${q}". Try: home, heart, arrow, user, github`);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError('All icon APIs are unreachable. Please check your internet connection.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [saveHistory]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  }, [query, doSearch]);

  const handleQuickSearch = useCallback((term: string) => {
    setQuery(term);
    doSearch(term);
  }, [doSearch]);

  const handlePreview = useCallback(async (icon: IconResult) => {
    setPreviewIcon(icon);
    setPreviewSvg('');
    setPreviewLoading(true);
    try {
      const svg = await fetchIconSvg(icon);
      setPreviewSvg(svg);
    } catch {
      setPreviewSvg('');
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleInsert = useCallback(async (icon: IconResult) => {
    try {
      const svg = await fetchIconSvg(icon);
      onInsertSvg(svg);
      addToast('success', `Inserted: ${icon.collection}:${icon.name}`);
    } catch {
      addToast('error', 'Failed to fetch icon SVG');
    }
  }, [onInsertSvg, addToast]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-12 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-5xl mx-3 sm:mx-4 max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-md">🔍</div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">SVG Icon Search</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">3 APIs with fallback · Iconify · theSVG · Simple Icons — all free, no key</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons... e.g. home, heart, arrow, settings, github, react"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </span>
              ) : '🔍 Search'}
            </button>
          </form>

          {/* Quick tags */}
          {results.length === 0 && !isLoading && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {searchHistory.length > 0 && (
                <>
                  <span className="text-[10px] text-gray-400 font-semibold self-center mr-0.5">Recent:</span>
                  {searchHistory.slice(0, 6).map((t) => (
                    <button key={`h-${t}`} onClick={() => handleQuickSearch(t)}
                      className="px-2 py-1 text-[11px] rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t}</button>
                  ))}
                  <span className="text-gray-300 dark:text-gray-600 mx-1 self-center">·</span>
                </>
              )}
              <span className="text-[10px] text-gray-400 font-semibold self-center mr-0.5">Popular:</span>
              {QUICK_SEARCHES.map((t) => (
                <button key={t} onClick={() => handleQuickSearch(t)}
                  className="px-2 py-1 text-[11px] rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors">{t}</button>
              ))}
            </div>
          )}

          {/* Data source indicator */}
          {dataSource && dataSource !== 'none' && results.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Powered by <strong className="text-emerald-600 dark:text-emerald-400">{dataSource}</strong> · {results.length} results
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" style={{ borderWidth: '3px' }} />
              <p className="text-sm font-medium">Searching multiple APIs...</p>
              <p className="text-xs mt-1">Trying Iconify → theSVG → Simple Icons</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-5xl mb-3">😔</span>
              <p className="text-sm font-medium text-center max-w-md">{error}</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {QUICK_SEARCHES.slice(0, 8).map((t) => (
                  <button key={t} onClick={() => handleQuickSearch(t)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t}</button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-6xl mb-4">🎨</span>
              <p className="text-lg font-bold text-gray-600 dark:text-gray-300">Search 200,000+ Open-Source SVG Icons</p>
              <p className="text-sm mt-1 text-center max-w-lg">Material Design · Lucide · Heroicons · Font Awesome · Bootstrap · Remix · Phosphor · Brand Icons & more</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs max-w-lg w-full">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-lg">🔵</span>
                  <div><strong className="block text-indigo-700 dark:text-indigo-300">Iconify API</strong><span className="text-gray-500">200K+ icons</span></div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-lg">🟢</span>
                  <div><strong className="block text-emerald-700 dark:text-emerald-300">theSVG</strong><span className="text-gray-500">5.6K+ brand icons</span></div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <span className="text-lg">🟡</span>
                  <div><strong className="block text-amber-700 dark:text-amber-300">Simple Icons</strong><span className="text-gray-500">1.5K+ brands</span></div>
                </div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
                {results.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => handlePreview(icon)}
                    className="group relative flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all hover:shadow-md hover:scale-105 active:scale-95"
                    title={`${icon.collection}:${icon.name}`}
                  >
                    <img
                      src={getThumbUrl(icon)}
                      alt={icon.name}
                      width={28}
                      height={28}
                      loading="lazy"
                      className="w-7 h-7"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate w-full text-center leading-tight">{icon.name}</span>
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-indigo-600/90 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-medium">Preview</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-[11px] text-gray-400 mt-4">
                Showing {results.length} results · {dataSource} API · Click any icon to preview & insert
              </p>
            </>
          )}
        </div>

        {/* Preview panel */}
        {previewIcon && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800/50 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Icon preview */}
              <div className="w-20 h-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center shrink-0">
                {previewLoading ? (
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                ) : previewSvg ? (
                  <div
                    className="w-12 h-12"
                    dangerouslySetInnerHTML={{ __html: previewSvg.replace(/<svg/, `<svg width="48" height="48" fill="${iconColor}" style="color:${iconColor}"`) }}
                  />
                ) : (
                  <img src={getThumbUrl(previewIcon)} alt={previewIcon.name} width={48} height={48} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{previewIcon.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium shrink-0">{previewIcon.set}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">{previewIcon.collection}:{previewIcon.name} · source: {previewIcon.source}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Color</label>
                    <input type="color" value={iconColor} onChange={(e) => setIconColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
                    <span className="text-[10px] text-gray-400 font-mono">{iconColor}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleInsert(previewIcon)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all text-xs font-medium shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                >
                  📥 Insert into Editor
                </button>
                <button
                  onClick={() => { setPreviewIcon(null); setPreviewSvg(''); }}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
