import { useState, useRef, useCallback, useEffect } from 'react';
import type { DrawElement, DrawTool } from '../types';

interface DrawModeProps {
  onExport: (svgCode: string) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const tools: { key: DrawTool; label: string; icon: string }[] = [
  { key: 'select', label: 'Select', icon: '👆' },
  { key: 'rect', label: 'Rectangle', icon: '⬜' },
  { key: 'circle', label: 'Circle', icon: '⭕' },
  { key: 'ellipse', label: 'Ellipse', icon: '🔵' },
  { key: 'line', label: 'Line', icon: '📏' },
  { key: 'path', label: 'Freehand', icon: '✏️' },
  { key: 'text', label: 'Text', icon: '🔤' },
];

const cursorMap: Record<DrawTool, string> = {
  select: 'default',
  rect: 'crosshair',
  circle: 'crosshair',
  ellipse: 'crosshair',
  line: 'crosshair',
  path: 'crosshair',
  text: 'text',
};

export function DrawMode({ onExport, addToast }: DrawModeProps) {
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [tool, setTool] = useState<DrawTool>('rect');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [fill, setFill] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e40af');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(24);
  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(600);
  const svgRef = useRef<SVGSVGElement>(null);
  const [textInput, setTextInput] = useState('');
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textModalOpen && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [textModalOpen]);

  const getSvgPoint = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, [canvasW, canvasH]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const point = getSvgPoint(e);

      if (tool === 'select') {
        const target = e.target as SVGElement;
        const targetId = target.id;
        if (targetId && targetId !== 'draw-canvas' && targetId !== 'grid-rect') {
          setSelectedId(targetId);
          const el = elements.find((el) => el.id === targetId);
          if (el) {
            setIsDragging(true);
            setDragOffset({ x: point.x - el.x, y: point.y - el.y });
          }
        } else {
          setSelectedId(null);
        }
      } else if (tool === 'text') {
        setTextPosition(point);
        setTextInput('');
        setTextModalOpen(true);
      } else if (tool === 'path') {
        setIsDrawing(true);
        setPathPoints([point]);
      } else {
        // rect, circle, ellipse, line — drag to draw
        setIsDrawing(true);
        setDrawStart(point);
      }
    },
    [tool, elements, getSvgPoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const point = getSvgPoint(e);

      if (isDragging && selectedId) {
        setElements((prev) =>
          prev.map((el) =>
            el.id === selectedId
              ? { ...el, x: point.x - dragOffset.x, y: point.y - dragOffset.y }
              : el
          )
        );
      } else if (isDrawing && tool === 'path') {
        setPathPoints((prev) => [...prev, point]);
      }
    },
    [isDragging, isDrawing, selectedId, dragOffset, tool, getSvgPoint]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const point = getSvgPoint(e);

      // Finish freehand path
      if (isDrawing && tool === 'path' && pathPoints.length > 2) {
        const pathData = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
        const id = `path-${Date.now()}`;
        const newEl: DrawElement = {
          id,
          type: 'path',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          fill: 'none',
          stroke: strokeColor,
          strokeWidth,
          opacity: 1,
          rotation: 0,
          pathData,
        };
        setElements((prev) => [...prev, newEl]);
        setSelectedId(id);
        addToast('success', 'Freehand path created');
      }

      // Finish rect, circle, ellipse, line from drag
      if (isDrawing && drawStart && (tool === 'rect' || tool === 'circle' || tool === 'ellipse' || tool === 'line')) {
        const x1 = Math.min(drawStart.x, point.x);
        const y1 = Math.min(drawStart.y, point.y);
        const w = Math.abs(point.x - drawStart.x);
        const h = Math.abs(point.y - drawStart.y);

        // Minimum size for shapes (ignore tiny clicks for shapes)
        if (tool === 'line' || w > 3 || h > 3) {
          const id = `${tool}-${Date.now()}`;
          const newEl: DrawElement = {
            id,
            type: tool,
            x: tool === 'line' ? drawStart.x : x1,
            y: tool === 'line' ? drawStart.y : y1,
            width: tool === 'line' ? 0 : w,
            height: tool === 'line' ? 0 : h,
            fill,
            stroke: strokeColor,
            strokeWidth,
            opacity: 1,
            rotation: 0,
            x2: tool === 'line' ? point.x : undefined,
            y2: tool === 'line' ? point.y : undefined,
          };
          setElements((prev) => [...prev, newEl]);
          setSelectedId(id);
          addToast('success', `${tool === 'line' ? 'Line' : tool.charAt(0).toUpperCase() + tool.slice(1)} created`);
        }
      }

      setIsDrawing(false);
      setIsDragging(false);
      setPathPoints([]);
      setDrawStart(null);
    },
    [isDrawing, drawStart, tool, pathPoints, strokeColor, strokeWidth, fill, addToast, getSvgPoint]
  );

  const handleDelete = useCallback(() => {
    if (selectedId) {
      setElements((prev) => prev.filter((el) => el.id !== selectedId));
      setSelectedId(null);
      addToast('info', 'Element deleted');
    }
  }, [selectedId, addToast]);

  const handleTextConfirm = useCallback(() => {
    if (!textPosition) return;
    const text = textInput.trim() || 'Text';
    const id = `text-${Date.now()}`;
    const newEl: DrawElement = {
      id,
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      width: 0,
      height: 0,
      fill,
      stroke: 'none',
      strokeWidth: 0,
      opacity: 1,
      rotation: 0,
      text,
      fontSize,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(id);
    setTextModalOpen(false);
    setTextInput('');
    setTextPosition(null);
    addToast('success', `Text added: "${text}"`);
  }, [textPosition, textInput, fill, fontSize, addToast]);

  const handleTextCancel = useCallback(() => {
    setTextModalOpen(false);
    setTextInput('');
    setTextPosition(null);
  }, []);

  const handleExport = useCallback(() => {
    const svgElements = elements
      .map((el) => {
        const base = `fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"`;
        const transform = el.rotation !== 0 ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : '';
        switch (el.type) {
          case 'rect':
            return `  <rect ${base}${transform} x="${el.x.toFixed(1)}" y="${el.y.toFixed(1)}" width="${Math.abs(el.width).toFixed(1)}" height="${Math.abs(el.height).toFixed(1)}" />`;
          case 'circle': {
            const r = Math.abs(el.width) / 2;
            return `  <circle ${base}${transform} cx="${(el.x + el.width / 2).toFixed(1)}" cy="${(el.y + el.height / 2).toFixed(1)}" r="${r.toFixed(1)}" />`;
          }
          case 'ellipse':
            return `  <ellipse ${base}${transform} cx="${(el.x + el.width / 2).toFixed(1)}" cy="${(el.y + el.height / 2).toFixed(1)}" rx="${Math.abs(el.width / 2).toFixed(1)}" ry="${Math.abs(el.height / 2).toFixed(1)}" />`;
          case 'line':
            return `  <line ${base}${transform} x1="${el.x.toFixed(1)}" y1="${el.y.toFixed(1)}" x2="${(el.x2 || el.x + 100).toFixed(1)}" y2="${(el.y2 || el.y + 100).toFixed(1)}" />`;
          case 'path':
            return `  <path ${base}${transform} d="${el.pathData || ''}" />`;
          case 'text':
            return `  <text ${base}${transform} x="${el.x.toFixed(1)}" y="${el.y.toFixed(1)}" font-size="${el.fontSize || 24}">${el.text || 'Text'}</text>`;
          default:
            return '';
        }
      })
      .join('\n');

    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasW} ${canvasH}" width="${canvasW}" height="${canvasH}">\n${svgElements}\n</svg>`;
    onExport(svgCode);
    addToast('success', `Exported ${elements.length} element(s) to SVG`);
  }, [elements, canvasW, canvasH, onExport, addToast]);

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[500px] animate-fade-in">
      {/* Tools sidebar */}
      <div className="lg:w-48 flex flex-row lg:flex-col gap-1.5 p-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto lg:overflow-visible shrink-0">
        <h3 className="hidden lg:block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 px-1">Tools</h3>
        {tools.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTool(t.key); setSelectedId(null); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors whitespace-nowrap font-medium ${
              tool === t.key
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-base">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}

        <div className="hidden lg:block w-full h-px bg-gray-200 dark:bg-gray-700 my-1" />

        {selectedId && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-colors whitespace-nowrap font-medium"
          >
            <span>🗑</span>
            <span>Delete</span>
          </button>
        )}

        {/* Quick color presets */}
        <div className="hidden lg:block mt-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Presets</h3>
          <div className="flex flex-wrap gap-1.5 px-1">
            {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#1e1e1e', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setFill(c)}
                className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="flex-1 overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-inner"
          style={{ cursor: cursorMap[tool] }}
        >
          <svg
            ref={svgRef}
            id="draw-canvas"
            className="w-full h-full"
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            style={{ minHeight: '400px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDrawing && tool === 'path' && pathPoints.length > 2) {
                const pathData = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
                const id = `path-${Date.now()}`;
                const newEl: DrawElement = {
                  id, type: 'path', x: 0, y: 0, width: 0, height: 0,
                  fill: 'none', stroke: strokeColor, strokeWidth, opacity: 1, rotation: 0, pathData,
                };
                setElements((prev) => [...prev, newEl]);
                setSelectedId(id);
              }
              setIsDrawing(false);
              setIsDragging(false);
              setPathPoints([]);
              setDrawStart(null);
            }}
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid-dark" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect id="grid-rect" width={canvasW} height={canvasH} fill="white" className="dark:hidden" />
            <rect id="grid-rect-dark" width={canvasW} height={canvasH} fill="#111827" className="hidden dark:block" />
            <rect width={canvasW} height={canvasH} fill="url(#grid)" className="dark:hidden" />
            <rect width={canvasW} height={canvasH} fill="url(#grid-dark)" className="hidden dark:block" />

            {/* Preview path being drawn */}
            {isDrawing && tool === 'path' && pathPoints.length > 1 && (
              <path
                d={pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Elements */}
            {elements.map((el) => {
              const isSelected = el.id === selectedId;
              const commonProps: Record<string, unknown> = {
                key: el.id,
                id: el.id,
                fill: el.fill,
                stroke: isSelected ? '#f59e0b' : el.stroke,
                strokeWidth: isSelected ? el.strokeWidth + 2 : el.strokeWidth,
                opacity: el.opacity,
                style: { cursor: tool === 'select' ? 'move' : undefined },
              };

              switch (el.type) {
                case 'rect':
                  return <rect {...commonProps} x={el.x} y={el.y} width={Math.abs(el.width)} height={Math.abs(el.height)} rx="2" />;
                case 'circle': {
                  const r = Math.abs(el.width) / 2;
                  return <circle {...commonProps} cx={el.x + el.width / 2} cy={el.y + el.height / 2} r={r} />;
                }
                case 'ellipse':
                  return <ellipse {...commonProps} cx={el.x + el.width / 2} cy={el.y + el.height / 2} rx={Math.abs(el.width / 2)} ry={Math.abs(el.height / 2)} />;
                case 'line':
                  return <line {...commonProps} x1={el.x} y1={el.y} x2={el.x2 || el.x + 100} y2={el.y2 || el.y + 100} strokeLinecap="round" />;
                case 'path':
                  return <path {...commonProps} d={el.pathData || ''} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
                case 'text':
                  return (
                    <text
                      {...commonProps}
                      x={el.x}
                      y={el.y}
                      fontSize={el.fontSize || 24}
                      fontFamily="system-ui, sans-serif"
                      dominantBaseline="hanging"
                    >
                      {el.text || 'Text'}
                    </text>
                  );
                default:
                  return null;
              }
            })}

            {/* Selection highlight rect */}
            {selectedElement && selectedElement.type !== 'path' && selectedElement.type !== 'line' && (
              <rect
                x={selectedElement.x - 4}
                y={selectedElement.y - 4}
                width={(selectedElement.type === 'text' ? 60 : Math.abs(selectedElement.width)) + 8}
                height={(selectedElement.type === 'text' ? (selectedElement.fontSize || 24) + 8 : Math.abs(selectedElement.height)) + 8}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                rx="3"
                pointerEvents="none"
              />
            )}
          </svg>
        </div>

        {/* Properties bar */}
        <div className="flex flex-wrap items-center gap-3 mt-2 px-3 py-2.5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fill</label>
            <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Stroke</label>
            <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">SW</label>
            <input
              type="number"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Math.max(0, Number(e.target.value)))}
              className="w-14 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50"
              min="0"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Font</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Math.max(8, Number(e.target.value)))}
              className="w-14 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50"
              min="8"
              max="200"
            />
          </div>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Canvas</label>
            <input
              type="number"
              value={canvasW}
              onChange={(e) => setCanvasW(Math.max(100, Number(e.target.value)))}
              className="w-16 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50"
              min="100"
            />
            <span className="text-gray-400 text-xs">×</span>
            <input
              type="number"
              value={canvasH}
              onChange={(e) => setCanvasH(Math.max(100, Number(e.target.value)))}
              className="w-16 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50"
              min="100"
            />
          </div>

          {selectedElement && (
            <>
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold capitalize">{selectedElement.type}</span>
              <span className="text-xs text-gray-400 font-mono">X:{Math.round(selectedElement.x)} Y:{Math.round(selectedElement.y)}</span>
              {selectedElement.type === 'text' && (
                <input
                  type="text"
                  value={selectedElement.text || ''}
                  onChange={(e) =>
                    setElements((prev) =>
                      prev.map((el) => (el.id === selectedElement.id ? { ...el, text: e.target.value } : el))
                    )
                  }
                  className="w-40 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50"
                  placeholder="Edit text..."
                />
              )}
            </>
          )}

          <div className="flex-1" />
          <span className="text-xs text-gray-400 font-medium">{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => { setElements([]); setSelectedId(null); }}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 font-medium"
          >
            Clear Canvas
          </button>
          <button
            onClick={handleExport}
            disabled={elements.length === 0}
            className="px-4 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium disabled:opacity-40 shadow-sm"
          >
            📤 Export to SVG
          </button>
        </div>
      </div>

      {/* Text Input Modal */}
      {textModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">🔤 Add Text</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter the text to place at position ({textPosition ? Math.round(textPosition.x) : 0}, {textPosition ? Math.round(textPosition.y) : 0})
            </p>
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextConfirm();
                if (e.key === 'Escape') handleTextCancel();
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              placeholder="Type your text here..."
            />
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Color</label>
                <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(8, Number(e.target.value)))}
                  className="w-20 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                  min="8"
                  max="200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTextCancel}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleTextConfirm}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-indigo-500/20"
              >
                ✓ Add Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
