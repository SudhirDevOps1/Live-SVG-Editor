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

const fontFamilies = [
  { label: 'Sans-serif', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Monospace', value: 'Courier New, monospace' },
  { label: 'Cursive', value: 'cursive' },
];

export function DrawMode({ onExport, addToast }: DrawModeProps) {
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [tool, setTool] = useState<DrawTool>('rect');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [fill, setFill] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e40af');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(600);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Focus text input when shown
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  const getSvgPoint = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, [canvasW, canvasH]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // If text input is showing, close it on click
      if (showTextInput && e.target === svgRef.current) {
        setShowTextInput(false);
      }

      const point = getSvgPoint(e);

      if (tool === 'select') {
        const target = e.target as SVGElement;
        if (target.id && target.id !== 'draw-canvas' && target.id !== 'grid-rect') {
          setSelectedId(target.id);
          const el = elements.find((el) => el.id === target.id);
          if (el) {
            setIsDragging(true);
            setDragOffset({ x: point.x - el.x, y: point.y - el.y });
          }
        } else {
          setSelectedId(null);
        }
      } else if (tool === 'path') {
        setIsDrawing(true);
        setPathPoints([point]);
      } else if (tool === 'text') {
        // Show text input overlay at click position
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        // Get container-relative coords (the SVG container)
        const container = svgRef.current?.parentElement || svgRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const containerX = e.clientX - containerRect.left;
        const containerY = e.clientY - containerRect.top;
        setShowTextInput(true);
        setTextInputPos({ x: containerX, y: containerY });
        setTextInputValue('');
      } else {
        // Handle rect, circle, ellipse, line
        const id = `${tool}-${Date.now()}`;
        const newEl: DrawElement = {
          id,
          type: tool,
          x: point.x,
          y: point.y,
          width: tool === 'line' ? 0 : 80,
          height: tool === 'line' ? 0 : 60,
          fill,
          stroke: strokeColor,
          strokeWidth,
          opacity: 1,
          rotation: 0,
          x2: tool === 'line' ? point.x + 120 : undefined,
          y2: tool === 'line' ? point.y + 120 : undefined,
        };
        setElements((prev) => [...prev, newEl]);
        setSelectedId(id);
        if (tool === 'rect' || tool === 'circle' || tool === 'ellipse') {
          setIsDrawing(true);
        }
      }
    },
    [tool, fill, strokeColor, strokeWidth, elements, getSvgPoint, showTextInput]
  );

  // Handle text input submission
  const handleTextSubmit = useCallback(() => {
    if (!textInputValue.trim()) {
      setShowTextInput(false);
      return;
    }

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) {
      setShowTextInput(false);
      return;
    }

    // Convert screen coordinates to SVG viewBox coordinates
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    const svgX = Number(textInputPos.x) * scaleX;
    const svgY = Number(textInputPos.y) * scaleY;

    const id = `text-${Date.now()}`;
    const newEl: DrawElement = {
      id,
      type: 'text',
      x: svgX,
      y: svgY,
      width: 0,
      height: 0,
      fill: '#ffffff',
      stroke: 'none',
      strokeWidth: 0,
      opacity: 1,
      rotation: 0,
      text: textInputValue,
      fontSize: 28,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 'bold',
      fontStyle: 'normal',
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(id);
    setShowTextInput(false);
    setTextInputValue('');
    setTool('select');
    addToast('success', `Text "${textInputValue}" added`);
  }, [textInputValue, textInputPos, canvasW, canvasH, addToast]);

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
      } else if (isDrawing && selectedId) {
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== selectedId) return el;
            if (tool === 'rect') {
              return { ...el, width: point.x - el.x, height: point.y - el.y };
            }
            if (tool === 'circle' || tool === 'ellipse') {
              const rx = Math.abs(point.x - el.x);
              const ry = Math.abs(point.y - el.y);
              return { ...el, width: rx * 2, height: ry * 2 };
            }
            if (tool === 'line') {
              return { ...el, x2: point.x, y2: point.y };
            }
            return el;
          })
        );
      }
    },
    [isDragging, isDrawing, selectedId, dragOffset, tool, getSvgPoint]
  );

  const handleMouseUp = useCallback(() => {
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
    setIsDrawing(false);
    setIsDragging(false);
    setPathPoints([]);
  }, [isDrawing, tool, pathPoints, strokeColor, strokeWidth, addToast]);

  const handleDelete = useCallback(() => {
    if (selectedId) {
      setElements((prev) => prev.filter((el) => el.id !== selectedId));
      setSelectedId(null);
      addToast('info', 'Element deleted');
    }
  }, [selectedId, addToast]);

  const handleExport = useCallback(() => {
    const svgElements = elements
      .map((el) => {
        const styleParts: string[] = [];
        if (el.fill !== 'none') styleParts.push(`fill="${el.fill}"`);
        else styleParts.push('fill="none"');
        if (el.stroke !== 'none' && el.stroke !== undefined) styleParts.push(`stroke="${el.stroke}"`);
        if (el.strokeWidth > 0) styleParts.push(`stroke-width="${el.strokeWidth}"`);
        styleParts.push(`opacity="${el.opacity}"`);
        styleParts.push(`id="${el.id}"`);
        const base = styleParts.join(' ');
        const transform = el.rotation !== 0 ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : '';

        switch (el.type) {
          case 'rect':
            return `  <rect ${base}${transform} x="${el.x.toFixed(1)}" y="${el.y.toFixed(1)}" width="${Math.max(1, Math.abs(el.width)).toFixed(1)}" height="${Math.max(1, Math.abs(el.height)).toFixed(1)}" rx="4" />`;
          case 'circle': {
            const r = Math.abs(el.width) / 2;
            return `  <circle ${base}${transform} cx="${(el.x + el.width / 2).toFixed(1)}" cy="${(el.y + el.height / 2).toFixed(1)}" r="${r.toFixed(1)}" />`;
          }
          case 'ellipse':
            return `  <ellipse ${base}${transform} cx="${(el.x + el.width / 2).toFixed(1)}" cy="${(el.y + el.height / 2).toFixed(1)}" rx="${Math.abs(el.width / 2).toFixed(1)}" ry="${Math.abs(el.height / 2).toFixed(1)}" />`;
          case 'line':
            return `  <line ${base}${transform} x1="${el.x.toFixed(1)}" y1="${el.y.toFixed(1)}" x2="${(el.x2 ?? el.x + 120).toFixed(1)}" y2="${(el.y2 ?? el.y + 120).toFixed(1)}" stroke-linecap="round" />`;
          case 'path':
            return `  <path ${base}${transform} d="${el.pathData || ''}" stroke-linecap="round" stroke-linejoin="round" />`;
          case 'text':
            return `  <text ${base}${transform} x="${el.x.toFixed(1)}" y="${el.y.toFixed(1)}" font-size="${el.fontSize || 24}" font-family="${el.fontFamily || 'system-ui, sans-serif'}" font-weight="${el.fontWeight || 'normal'}" font-style="${el.fontStyle || 'normal'}">${(el.text || '').replace(/</g, '&lt;')}</text>`;
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

  // Update selected element properties
  const updateSelectedEl = useCallback((updates: Partial<DrawElement>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el))
    );
  }, [selectedId]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[500px] animate-fade-in">
      {/* Tools sidebar */}
      <div className="lg:w-44 flex flex-row lg:flex-col gap-1.5 p-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto lg:overflow-visible shrink-0">
        {tools.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTool(t.key); setSelectedId(null); setShowTextInput(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
              tool === t.key
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}

        {selectedId && (
          <>
            <div className="hidden lg:block w-full h-px bg-gray-200 dark:bg-gray-700 my-1" />
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-colors whitespace-nowrap"
            >
              <span>🗑</span>
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      {/* Canvas + Properties */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Canvas area */}
        <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 relative" style={{
          backgroundImage: 'linear-gradient(135deg, #f3f4f6 25%, transparent 25%), linear-gradient(225deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(315deg, #f3f4f6 25%, transparent 25%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
        }}>
          <svg
            ref={svgRef}
            id="draw-canvas"
            className="w-full h-full"
            viewBox={`0 0 ${canvasW} ${canvasH}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: tool === 'select' ? 'default' : tool === 'text' ? 'text' : 'crosshair' }}
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect id="grid-rect" width={canvasW} height={canvasH} fill="url(#grid)" />

            {/* Preview path being drawn */}
            {isDrawing && tool === 'path' && pathPoints.length > 1 && (
              <path
                d={pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity="0.6"
              />
            )}

            {/* Text input indicator */}
            {showTextInput && (
              <circle
                cx={Number(textInputPos.x) * canvasW / (svgRef.current?.getBoundingClientRect()?.width || 1)}
                cy={Number(textInputPos.y) * canvasH / (svgRef.current?.getBoundingClientRect()?.height || 1)}
                r="4"
                fill="#6366f1"
                filter="url(#glow)"
              />
            )}

            {/* Elements */}
            {elements.map((el) => {
              const isSelected = el.id === selectedId;
              const commonProps = {
                key: el.id,
                id: el.id,
                fill: el.fill,
                stroke: isSelected ? '#f59e0b' : el.stroke,
                strokeWidth: isSelected ? el.strokeWidth + 1 : el.strokeWidth,
                opacity: el.opacity,
              };

              switch (el.type) {
                case 'rect':
                  return (
                    <g key={el.id}>
                      <rect {...commonProps} x={el.x} y={el.y} width={Math.abs(el.width)} height={Math.abs(el.height)} rx="4" />
                      {isSelected && (
                        <rect x={el.x - 2} y={el.y - 2} width={Math.abs(el.width) + 4} height={Math.abs(el.height) + 4}
                          fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 2" rx="4" />
                      )}
                    </g>
                  );
                case 'circle': {
                  const r = Math.abs(el.width) / 2;
                  const cx = el.x + el.width / 2;
                  const cy = el.y + el.height / 2;
                  return (
                    <g key={el.id}>
                      <circle {...commonProps} cx={cx} cy={cy} r={r} />
                      {isSelected && (
                        <circle cx={cx} cy={cy} r={r + 3}
                          fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 2" />
                      )}
                    </g>
                  );
                }
                case 'ellipse': {
                  const ecx = el.x + el.width / 2;
                  const ecy = el.y + el.height / 2;
                  return (
                    <g key={el.id}>
                      <ellipse {...commonProps} cx={ecx} cy={ecy} rx={Math.abs(el.width / 2)} ry={Math.abs(el.height / 2)} />
                      {isSelected && (
                        <ellipse cx={ecx} cy={ecy} rx={Math.abs(el.width / 2) + 3} ry={Math.abs(el.height / 2) + 3}
                          fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 2" />
                      )}
                    </g>
                  );
                }
                case 'line': {
                  const x2 = el.x2 ?? el.x + 120;
                  const y2 = el.y2 ?? el.y + 120;
                  return (
                    <g key={el.id}>
                      <line {...commonProps} x1={el.x} y1={el.y} x2={x2} y2={y2} strokeLinecap="round" />
                      {isSelected && (
                        <>
                          <circle cx={el.x} cy={el.y} r="4" fill="#6366f1" />
                          <circle cx={x2} cy={y2} r="4" fill="#6366f1" />
                        </>
                      )}
                    </g>
                  );
                }
                case 'path':
                  return (
                    <g key={el.id}>
                      <path {...commonProps} d={el.pathData || ''} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  );
                case 'text':
                  return (
                    <g key={el.id}>
                      <text
                        {...commonProps}
                        x={el.x}
                        y={el.y}
                        fontSize={el.fontSize || 24}
                        fontFamily={el.fontFamily || 'system-ui, sans-serif'}
                        fontWeight={el.fontWeight || 'normal'}
                        fontStyle={el.fontStyle || 'normal'}
                        paintOrder="stroke"
                        stroke={isSelected ? '#f59e0b' : el.stroke !== 'none' ? el.stroke : 'transparent'}
                        strokeWidth={isSelected ? 2 : 0}
                        fill={el.fill}
                      >
                        {el.text || 'Text'}
                      </text>
                      {isSelected && (
                        <rect x={el.x - 4} y={el.y - (el.fontSize || 24) - 2}
                          width={((el.text || 'Text').length) * ((el.fontSize || 24) * 0.6) + 8}
                          height={(el.fontSize || 24) + 8}
                          fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 2" rx="4" />
                      )}
                    </g>
                  );
                default:
                  return null;
              }
            })}
          </svg>

          {/* HTML Text Input Overlay */}
          {showTextInput && (
            <div
              className="absolute z-30 animate-fade-in"
              style={{
                left: `${Math.min(Number(textInputPos.x) - 10, (svgRef.current?.clientWidth || 800) - 300)}px`,
                top: `${Math.max(Number(textInputPos.y) - 45, 5)}px`,
              }}
            >
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-600 p-2.5 animate-pulse-glow">
                <input
                  ref={textInputRef}
                  type="text"
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTextSubmit();
                    if (e.key === 'Escape') { setShowTextInput(false); setTextInputValue(''); }
                  }}
                  placeholder="Type text here..."
                  className="w-56 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                  autoFocus
                />
                <button
                  onClick={handleTextSubmit}
                  className="px-3 py-2 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
                >
                  ✓ Add
                </button>
                <button
                  onClick={() => { setShowTextInput(false); setTextInputValue(''); }}
                  className="px-2 py-2 text-xs rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Properties bar */}
        <div className="flex flex-wrap items-center gap-3 mt-2 px-2 py-2">
          {/* Shape colors */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fill</label>
            <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600 bg-transparent" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Stroke</label>
            <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600 bg-transparent" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">SW</label>
            <input type="number" value={strokeWidth} onChange={(e) => setStrokeWidth(Math.max(0, Number(e.target.value)))} className="w-14 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100" min="0" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Canvas</label>
            <input type="number" value={canvasW} onChange={(e) => setCanvasW(Math.max(100, Number(e.target.value)))} className="w-14 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100" min="100" />
            <span className="text-gray-400">×</span>
            <input type="number" value={canvasH} onChange={(e) => setCanvasH(Math.max(100, Number(e.target.value)))} className="w-14 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100" min="100" />
          </div>

          {/* Selected element properties */}
          {selectedElement && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium capitalize bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{selectedElement.type}</span>
              <span className="text-xs text-gray-500 font-mono">X:{Math.round(selectedElement.x)} Y:{Math.round(selectedElement.y)}</span>

              {/* Text-specific controls */}
              {selectedElement.type === 'text' && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <input
                    type="text"
                    value={selectedElement.text || ''}
                    onChange={(e) => updateSelectedEl({ text: e.target.value })}
                    className="w-36 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                    placeholder="Enter text here..."
                  />
                  <select
                    value={selectedElement.fontSize || 24}
                    onChange={(e) => updateSelectedEl({ fontSize: Number(e.target.value) })}
                    className="w-16 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                  >
                    {[12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96].map((s) => (
                      <option key={s} value={s}>{s}px</option>
                    ))}
                  </select>
                  <select
                    value={selectedElement.fontFamily || 'system-ui, sans-serif'}
                    onChange={(e) => updateSelectedEl({ fontFamily: e.target.value })}
                    className="w-28 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                  >
                    {fontFamilies.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  {/* Bold toggle */}
                  <button
                    onClick={() => updateSelectedEl({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`w-8 h-8 rounded-lg border transition-colors font-bold text-sm ${
                      selectedElement.fontWeight === 'bold'
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    B
                  </button>
                  {/* Italic toggle */}
                  <button
                    onClick={() => updateSelectedEl({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`w-8 h-8 rounded-lg border transition-colors text-sm italic ${
                      selectedElement.fontStyle === 'italic'
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    I
                  </button>
                  {/* Text color */}
                  <div className="flex items-center gap-1">
                    <label className="text-[10px] text-gray-500">Color</label>
                    <input
                      type="color"
                      value={selectedElement.fill || '#ffffff'}
                      onChange={(e) => updateSelectedEl({ fill: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600 bg-transparent"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex-1" />
          <span className="text-xs text-gray-400">{elements.length} elements</span>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md"
          >
            📤 Export to SVG
          </button>
        </div>
      </div>
    </div>
  );
}
