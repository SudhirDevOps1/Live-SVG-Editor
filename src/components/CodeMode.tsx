import { useState, useCallback } from 'react';
import type { CodeLanguage } from '../types';
import { svgToReactComponent, svgToReactNative, svgToHtml } from '../utils/codeGenerators';
import { copyToClipboard, downloadReactComponent } from '../utils/exportHelpers';
import { CodeHighlighter } from './CodeHighlighter';

interface CodeModeProps {
  svgCode: string;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const languages: { key: CodeLanguage; label: string; icon: string; ext: string }[] = [
  { key: 'react', label: 'React JSX', icon: '⚛️', ext: '.jsx' },
  { key: 'react-native', label: 'React Native', icon: '📱', ext: '.tsx' },
  { key: 'html', label: 'HTML', icon: '🌐', ext: '.html' },
];

const generators: Record<CodeLanguage, (code: string) => string> = {
  react: svgToReactComponent,
  'react-native': svgToReactNative,
  html: svgToHtml,
};

export function CodeMode({ svgCode, addToast }: CodeModeProps) {
  const [lang, setLang] = useState<CodeLanguage>('react');

  const generatedCode = generators[lang](svgCode);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(generatedCode);
    addToast(ok ? 'success' : 'error', ok ? 'Code copied to clipboard!' : 'Failed to copy');
  }, [generatedCode, addToast]);

  const handleDownload = useCallback(() => {
    const info = languages.find((l) => l.key === lang)!;
    const filename = lang === 'html' ? 'svg-image.html' : `SvgIcon${info.ext}`;
    downloadReactComponent(generatedCode, filename);
    addToast('success', `Downloaded ${filename}`);
  }, [generatedCode, lang, addToast]);

  const currentLang = languages.find((l) => l.key === lang)!;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[500px] animate-fade-in">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="flex gap-1 mb-2">
          {languages.map((l) => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors font-medium ${
                lang === l.key
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        {/* Code display with syntax highlighting */}
        <div className="flex-1 relative">
          <CodeHighlighter
            code={generatedCode}
            readOnly
            placeholder="Generate code from your SVG..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium shadow-lg shadow-indigo-500/20"
          >
            📋 Copy Code
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all text-sm font-medium shadow-lg shadow-emerald-500/20"
          >
            💾 Download {currentLang.ext}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:w-80 flex flex-col">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">Preview</h3>
        <div className="flex-1 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-auto p-4"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: svgCode
                .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
                .replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
                .replace(/javascript:/gi, ''),
            }}
          />
        </div>
      </div>
    </div>
  );
}
