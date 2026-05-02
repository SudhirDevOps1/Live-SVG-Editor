import { useState, useMemo, useCallback } from 'react';
import type { SvgElementInfo } from '../types';

interface CustomizeModeProps {
  svgCode: string;
  onCodeChange: (code: string) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

function parseSvgElements(svgCode: string): SvgElementInfo[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');
    if (doc.querySelector('parsererror')) return [];

    const elements: SvgElementInfo[] = [];
    const all = doc.querySelectorAll('*');
    all.forEach((el, index) => {
      const attributes: Record<string, string> = {};
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        attributes[attr.name] = attr.value;
      }
      elements.push({
        id: el.id || `el-${index}-${el.tagName.toLowerCase()}`,
        tag: el.tagName.toLowerCase(),
        attributes,
      });
    });
    return elements;
  } catch {
    return [];
  }
}

export function CustomizeMode({ svgCode, onCodeChange, addToast }: CustomizeModeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fill, setFill] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeW, setStrokeW] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const elements = useMemo(() => parseSvgElements(svgCode), [svgCode]);

  const handleSelect = useCallback(
    (el: SvgElementInfo) => {
      setSelectedId(el.id);
      setFill(el.attributes.fill || '#000000');
      setStrokeColor(el.attributes.stroke || '#000000');
      setStrokeW(Number(el.attributes['stroke-width'] ?? 1));
      setOpacity(Number(el.attributes.opacity ?? 1));

      const transform = el.attributes.transform || '';
      const translateMatch = transform.match(/translate\(([-\d.]+),?\s*([-\d.]*)\)/);
      const scaleMatch = transform.match(/scale\(([-\d.]+)\)/);
      const rotateMatch = transform.match(/rotate\(([-\d.]+)\)/);

      setTranslateX(Number(translateMatch?.[1] || 0));
      setTranslateY(Number(translateMatch?.[2] || 0));
      setScale(Number(scaleMatch?.[1] || 1));
      setRotate(Number(rotateMatch?.[1] || 0));
    },
    []
  );

  const applyChanges = useCallback(() => {
    if (!selectedId) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');

      let target: Element | null = doc.getElementById(selectedId);
      if (!target) {
        const match = selectedId.match(/^el-(\d+)-/);
        if (match) {
          const all = doc.querySelectorAll('*');
          target = all[Number(match[1])] || null;
        }
      }

      if (target) {
        target.setAttribute('fill', fill);
        target.setAttribute('stroke', strokeColor);
        target.setAttribute('stroke-width', String(strokeW));
        target.setAttribute('opacity', String(opacity));

        const transforms: string[] = [];
        if (translateX !== 0 || translateY !== 0) transforms.push(`translate(${translateX}, ${translateY})`);
        if (scale !== 1) transforms.push(`scale(${scale})`);
        if (rotate !== 0) transforms.push(`rotate(${rotate})`);
        if (transforms.length > 0) {
          target.setAttribute('transform', transforms.join(' '));
        }

        const serializer = new XMLSerializer();
        let result = serializer.serializeToString(doc);
        result = result.replace(/<\?xml[^?]*\?>\s*/, '');
        onCodeChange(result);
        addToast('success', 'Changes applied to element');
      } else {
        addToast('error', 'Could not find element to modify');
      }
    } catch {
      addToast('error', 'Error applying changes');
    }
  }, [selectedId, svgCode, fill, strokeColor, strokeW, opacity, translateX, translateY, scale, rotate, onCodeChange, addToast]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[500px]">
      {/* Elements list */}
      <div className="lg:w-64 p-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-auto max-h-64 lg:max-h-full">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
          Elements ({elements.length})
        </h3>
        {elements.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">No elements found. Load an SVG first.</p>
        )}
        <div className="space-y-0.5">
          {elements.map((el) => (
            <button
              key={el.id}
              onClick={() => handleSelect(el)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-colors truncate ${
                selectedId === el.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/50'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              &lt;{el.tag}&gt;
              <span className="text-[10px] text-gray-400 ml-1.5">{el.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Properties panel */}
      <div className="flex-1 p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-4 uppercase tracking-wider">Properties</h3>
        {selectedId ? (
          <div className="space-y-4 max-w-lg">
            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Fill Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
                  <input type="text" value={fill} onChange={(e) => setFill(e.target.value)} className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Stroke Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
                  <input type="text" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 font-mono" />
                </div>
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Stroke Width: <span className="font-mono">{strokeW}px</span>
              </label>
              <input type="range" min="0" max="20" step="0.5" value={strokeW} onChange={(e) => setStrokeW(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Opacity: <span className="font-mono">{opacity.toFixed(2)}</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            {/* Transform */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Transform</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Translate X: {translateX}</label>
                  <input type="range" min="-200" max="200" value={translateX} onChange={(e) => setTranslateX(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Translate Y: {translateY}</label>
                  <input type="range" min="-200" max="200" value={translateY} onChange={(e) => setTranslateY(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Scale: {scale.toFixed(1)}x</label>
                  <input type="range" min="0.1" max="5" step="0.1" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Rotate: {rotate}°</label>
                  <input type="range" min="0" max="360" value={rotate} onChange={(e) => setRotate(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
              </div>
            </div>

            <button
              onClick={applyChanges}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-indigo-500/20"
            >
              ✓ Apply Changes
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <span className="text-4xl mb-2">🖌️</span>
            <p className="text-sm">Select an element to customize</p>
          </div>
        )}
      </div>
    </div>
  );
}
