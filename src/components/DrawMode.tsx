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
  { key: 'diamond', label: 'Diamond', icon: '🔷' },
  { key: 'star', label: 'Star', icon: '⭐' },
  { key: 'polygon', label: 'Polygon', icon: '⬡' },
  { key: 'line', label: 'Line', icon: '📏' },
  { key: 'arrow', label: 'Arrow', icon: '➡️' },
  { key: 'path', label: 'Freehand', icon: '✏️' },
  { key: 'text', label: 'Text', icon: '🔤' },
];

const cursorMap: Record<DrawTool, string> = {
  select: 'default', rect: 'crosshair', circle: 'crosshair', ellipse: 'crosshair',
  line: 'crosshair', path: 'crosshair', text: 'text',
  star: 'crosshair', polygon: 'crosshair', arrow: 'crosshair', diamond: 'crosshair',
};

function genStarPts(cx: number, cy: number, or: number, ir: number, n: number): string {
  const p: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? or : ir;
    const a = (Math.PI * i) / n - Math.PI / 2;
    p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(' ');
}
function genPolyPts(cx: number, cy: number, r: number, n: number): string {
  const p: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(' ');
}
function genDiamondPts(cx: number, cy: number, w: number, h: number): string {
  return `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
}

/**
 * Convert raw mouse points into a smooth SVG path using quadratic bezier curves.
 * Midpoints become control points for smooth curves through actual points.
 */
function pointsToSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  if (pts.length === 2) {
    return `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
  }

  // Simplify: skip points that are very close to each other (within 2px)
  const simplified: { x: number; y: number }[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const prev = simplified[simplified.length - 1];
    const dx = pts[i].x - prev.x;
    const dy = pts[i].y - prev.y;
    if (dx * dx + dy * dy > 4) {
      simplified.push(pts[i]);
    }
  }
  if (simplified.length < 2) {
    return `M${simplified[0].x.toFixed(1)} ${simplified[0].y.toFixed(1)}`;
  }

  let d = `M${simplified[0].x.toFixed(1)} ${simplified[0].y.toFixed(1)}`;

  for (let i = 1; i < simplified.length - 1; i++) {
    const curr = simplified[i];
    const next = simplified[i + 1];
    // Midpoint between current and next becomes the end of the curve segment
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    // Current point becomes the control point
    d += ` Q${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }

  // Last point: straight line to the end
  const last = simplified[simplified.length - 1];
  d += ` L${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

  return d;
}

export function DrawMode({ onExport, addToast }: DrawModeProps) {
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [tool, setTool] = useState<DrawTool>('rect');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; el: DrawElement } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [fill, setFill] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e40af');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('system-ui, sans-serif');
  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(600);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize] = useState(20);
  const [polygonSides, setPolygonSides] = useState(6);
  const [starPts] = useState(5);
  const svgRef = useRef<SVGSVGElement>(null);
  const [textInput, setTextInput] = useState('');
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Draw undo/redo
  const [drawHistory, setDrawHistory] = useState<DrawElement[][]>([[]]);
  const [drawHistoryIdx, setDrawHistoryIdx] = useState(0);

  const pushDrawHistory = useCallback((newElements: DrawElement[]) => {
    setDrawHistory((prev) => {
      const sliced = prev.slice(0, drawHistoryIdx + 1);
      sliced.push([...newElements]);
      if (sliced.length > 100) sliced.shift();
      return sliced;
    });
    setDrawHistoryIdx((prev) => Math.min(prev + 1, 99));
  }, [drawHistoryIdx]);

  const handleDrawUndo = useCallback(() => {
    if (drawHistoryIdx > 0) {
      const newIdx = drawHistoryIdx - 1;
      setDrawHistoryIdx(newIdx);
      setElements([...drawHistory[newIdx]]);
      setSelectedId(null);
      addToast('info', 'Undo');
    }
  }, [drawHistoryIdx, drawHistory, addToast]);

  const handleDrawRedo = useCallback(() => {
    if (drawHistoryIdx < drawHistory.length - 1) {
      const newIdx = drawHistoryIdx + 1;
      setDrawHistoryIdx(newIdx);
      setElements([...drawHistory[newIdx]]);
      setSelectedId(null);
      addToast('info', 'Redo');
    }
  }, [drawHistoryIdx, drawHistory, addToast]);

  const updateElements = useCallback((updater: (prev: DrawElement[]) => DrawElement[]) => {
    setElements((prev) => {
      const next = updater(prev);
      pushDrawHistory(next);
      return next;
    });
  }, [pushDrawHistory]);

  useEffect(() => {
    if (textModalOpen && textInputRef.current) textInputRef.current.focus();
  }, [textModalOpen]);

  const snapPoint = useCallback((val: number): number => snapToGrid ? Math.round(val / gridSize) * gridSize : val, [snapToGrid, gridSize]);

  const getSvgPoint = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const sx = canvasW / rect.width;
    const sy = canvasH / rect.height;
    return { x: snapPoint((e.clientX - rect.left) * sx), y: snapPoint((e.clientY - rect.top) * sy) };
  }, [canvasW, canvasH, snapPoint]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (textModalOpen) return;
      const mod = e.ctrlKey || e.metaKey;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA')) {
        e.preventDefault(); updateElements((p) => p.filter((el) => el.id !== selectedId)); setSelectedId(null); addToast('info', 'Deleted');
      } else if (mod && e.key === 'd') {
        e.preventDefault(); handleDuplicate();
      } else if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); handleDrawUndo();
      } else if ((mod && e.key === 'z' && e.shiftKey) || (mod && e.key === 'y')) {
        e.preventDefault(); handleDrawRedo();
      } else if (selectedId) {
        const n = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowUp') { e.preventDefault(); updateElements((p) => p.map((el) => el.id === selectedId ? { ...el, y: el.y - n } : el)); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); updateElements((p) => p.map((el) => el.id === selectedId ? { ...el, y: el.y + n } : el)); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); updateElements((p) => p.map((el) => el.id === selectedId ? { ...el, x: el.x - n } : el)); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); updateElements((p) => p.map((el) => el.id === selectedId ? { ...el, x: el.x + n } : el)); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedId, textModalOpen, updateElements, addToast, handleDrawUndo, handleDrawRedo]); // eslint-disable-line

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSvgPoint(e);
    const target = e.target as SVGElement;

    // Resize handle
    if (target.dataset.handle) {
      const el = elements.find((el) => el.id === selectedId);
      if (el) { setIsResizing(true); setResizeHandle(target.dataset.handle); setResizeStart({ x: point.x, y: point.y, el: { ...el } }); return; }
    }

    if (tool === 'select') {
      const tid = target.id;
      if (tid && tid !== 'draw-canvas' && tid !== 'grid-rect' && tid !== 'grid-rect-dark' && !tid.startsWith('handle-') && !tid.startsWith('sel-')) {
        setSelectedId(tid);
        const el = elements.find((el) => el.id === tid);
        if (el) { setIsDragging(true); setDragOffset({ x: point.x - el.x, y: point.y - el.y }); }
      } else { setSelectedId(null); }
    } else if (tool === 'text') {
      setTextPosition(point); setTextInput(''); setEditingTextId(null); setTextModalOpen(true);
    } else if (tool === 'path') {
      setIsDrawing(true); setPathPoints([point]);
    } else {
      setIsDrawing(true); setDrawStart(point);
    }
  }, [tool, elements, getSvgPoint, selectedId]);

  // Double-click to edit text
  const handleDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    const tid = target.id;
    const el = elements.find((el) => el.id === tid);
    if (el && el.type === 'text') {
      setSelectedId(tid);
      setEditingTextId(tid);
      setTextInput(el.text || '');
      setTextPosition({ x: el.x, y: el.y });
      setFontFamily(el.fontFamily || 'system-ui, sans-serif');
      setFontSize(el.fontSize || 24);
      setTextModalOpen(true);
      setTool('select');
    }
  }, [elements]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSvgPoint(e);
    if (isResizing && resizeStart && selectedId) {
      const { el } = resizeStart;
      const dx = point.x - resizeStart.x;
      const dy = point.y - resizeStart.y;
      updateElements((prev) => prev.map((item) => {
        if (item.id !== selectedId) return item;
        let nx = el.x, ny = el.y, nw = el.width, nh = el.height;
        if (resizeHandle.includes('e')) nw = Math.max(5, el.width + dx);
        if (resizeHandle.includes('w')) { nw = Math.max(5, el.width - dx); nx = el.x + dx; }
        if (resizeHandle.includes('s')) nh = Math.max(5, el.height + dy);
        if (resizeHandle.includes('n')) { nh = Math.max(5, el.height - dy); ny = el.y + dy; }
        return { ...item, x: nx, y: ny, width: nw, height: nh };
      }));
    } else if (isDragging && selectedId) {
      updateElements((prev) => prev.map((el) => el.id === selectedId ? { ...el, x: point.x - dragOffset.x, y: point.y - dragOffset.y } : el));
    } else if (isDrawing && tool === 'path') {
      setPathPoints((prev) => [...prev, point]);
    }
  }, [isResizing, isDragging, selectedId, dragOffset, tool, getSvgPoint, resizeStart, resizeHandle, updateElements]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSvgPoint(e);
    if (isResizing) { setIsResizing(false); setResizeStart(null); setResizeHandle(''); return; }

    if (isDrawing && tool === 'path' && pathPoints.length > 2) {
      const pd = pointsToSmoothPath(pathPoints);
      const id = `path-${Date.now()}`;
      updateElements((prev) => [...prev, { id, type: 'path', x: 0, y: 0, width: 0, height: 0, fill: 'none', stroke: strokeColor, strokeWidth, opacity: 1, rotation: 0, pathData: pd }]);
      setSelectedId(id);
      addToast('success', 'Freehand path created');
    }

    if (isDrawing && drawStart && (tool === 'rect' || tool === 'circle' || tool === 'ellipse' || tool === 'line' || tool === 'arrow' || tool === 'star' || tool === 'polygon' || tool === 'diamond')) {
      const x1 = Math.min(drawStart.x, point.x);
      const y1 = Math.min(drawStart.y, point.y);
      const w = Math.abs(point.x - drawStart.x);
      const h = Math.abs(point.y - drawStart.y);
      if (tool === 'line' || tool === 'arrow' || w > 3 || h > 3) {
        const id = `${tool}-${Date.now()}`;
        updateElements((prev) => [...prev, {
          id, type: tool,
          x: (tool === 'line' || tool === 'arrow') ? drawStart.x : x1,
          y: (tool === 'line' || tool === 'arrow') ? drawStart.y : y1,
          width: (tool === 'line' || tool === 'arrow') ? 0 : w,
          height: (tool === 'line' || tool === 'arrow') ? 0 : h,
          fill, stroke: strokeColor, strokeWidth, opacity: 1, rotation: 0, x2: point.x, y2: point.y,
        }]);
        setSelectedId(id);
        addToast('success', `${tool.charAt(0).toUpperCase() + tool.slice(1)} created`);
      }
    }

    setIsDrawing(false); setIsDragging(false); setPathPoints([]); setDrawStart(null);
  }, [isDrawing, isResizing, drawStart, tool, pathPoints, strokeColor, strokeWidth, fill, addToast, getSvgPoint, updateElements]);

  const handleDelete = useCallback(() => { if (selectedId) { updateElements((p) => p.filter((el) => el.id !== selectedId)); setSelectedId(null); addToast('info', 'Deleted'); } }, [selectedId, updateElements, addToast]);

  const handleDuplicate = useCallback(() => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    const id = `${el.type}-${Date.now()}`;
    updateElements((prev) => [...prev, { ...el, id, x: el.x + 20, y: el.y + 20 }]);
    setSelectedId(id);
    addToast('success', 'Duplicated');
  }, [selectedId, elements, updateElements, addToast]);

  const handleBringToFront = useCallback(() => {
    if (!selectedId) return;
    updateElements((prev) => { const i = prev.findIndex((e) => e.id === selectedId); if (i === -1 || i === prev.length - 1) return prev; const el = prev[i]; return [...prev.filter((_, j) => j !== i), el]; });
    addToast('info', 'Front');
  }, [selectedId, updateElements, addToast]);

  const handleSendToBack = useCallback(() => {
    if (!selectedId) return;
    updateElements((prev) => { const i = prev.findIndex((e) => e.id === selectedId); if (i <= 0) return prev; const el = prev[i]; return [el, ...prev.filter((_, j) => j !== i)]; });
    addToast('info', 'Back');
  }, [selectedId, updateElements, addToast]);

  const handleTextConfirm = useCallback(() => {
    if (!textPosition) return;
    const text = textInput.trim() || 'Text';
    if (editingTextId) {
      // Edit existing text
      updateElements((prev) => prev.map((el) => el.id === editingTextId ? { ...el, text } : el));
      addToast('success', `Text updated: "${text}"`);
    } else {
      // New text
      const id = `text-${Date.now()}`;
      updateElements((prev) => [...prev, { id, type: 'text', x: textPosition.x, y: textPosition.y, width: 0, height: 0, fill, stroke: 'none', strokeWidth: 0, opacity: 1, rotation: 0, text, fontSize, fontFamily }]);
      setSelectedId(id);
      addToast('success', `Text added: "${text}"`);
    }
    setTextModalOpen(false); setTextInput(''); setTextPosition(null); setEditingTextId(null);
  }, [textPosition, textInput, fill, fontSize, fontFamily, editingTextId, updateElements, addToast]);

  const handleTextCancel = useCallback(() => { setTextModalOpen(false); setTextInput(''); setTextPosition(null); setEditingTextId(null); }, []);

  const handleExport = useCallback(() => {
    const defs = elements.some((e) => e.type === 'arrow') ? `\n  <defs><marker id="ah" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="context-stroke"/></marker></defs>` : '';
    const els = elements.map((el) => {
      const b = `fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"`;
      const t = el.rotation !== 0 ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : '';
      switch (el.type) {
        case 'rect': return `  <rect ${b}${t} x="${el.x.toFixed(1)}" y="${el.y.toFixed(1)}" width="${Math.abs(el.width).toFixed(1)}" height="${Math.abs(el.height).toFixed(1)}" rx="2"/>`;
        case 'circle': return `  <circle ${b}${t} cx="${(el.x + el.width / 2).toFixed(1)}" cy="${(el.y + el.height / 2).toFixed(1)}" r="${(Math.abs(el.width) / 2).toFixed(1)}"/>`;
        case 'ellipse': return `  <ellipse ${b}${t} cx="${(el.x + el.width / 2).toFixed(1)}" cy="${(el.y + el.height / 2).toFixed(1)}" rx="${(Math.abs(el.width) / 2).toFixed(1)}" ry="${(Math.abs(el.height) / 2).toFixed(1)}"/>`;
        case 'line': return `  <line ${b}${t} x1="${el.x.toFixed(1)}" y1="${el.y.toFixed(1)}" x2="${(el.x2 || el.x + 100).toFixed(1)}" y2="${(el.y2 || el.y + 100).toFixed(1)}"/>`;
        case 'arrow': return `  <line ${b}${t} x1="${el.x.toFixed(1)}" y1="${el.y.toFixed(1)}" x2="${(el.x2 || el.x + 100).toFixed(1)}" y2="${(el.y2 || el.y + 100).toFixed(1)}" marker-end="url(#ah)"/>`;
        case 'path': return `  <path ${b}${t} d="${el.pathData || ''}"/>`;
        case 'text': return `  <text ${b}${t} x="${el.x.toFixed(1)}" y="${el.y.toFixed(1)}" font-size="${el.fontSize || 24}" font-family="${el.fontFamily || 'system-ui, sans-serif'}">${el.text || 'Text'}</text>`;
        case 'star': return `  <polygon ${b}${t} points="${genStarPts(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, Math.min(el.width, el.height) / 4, starPts)}"/>`;
        case 'polygon': return `  <polygon ${b}${t} points="${genPolyPts(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, polygonSides)}"/>`;
        case 'diamond': return `  <polygon ${b}${t} points="${genDiamondPts(el.x + el.width / 2, el.y + el.height / 2, el.width, el.height)}"/>`;
        default: return '';
      }
    }).join('\n');
    onExport(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasW} ${canvasH}" width="${canvasW}" height="${canvasH}">${defs}\n${els}\n</svg>`);
    addToast('success', `Exported ${elements.length} element(s)`);
  }, [elements, canvasW, canvasH, onExport, addToast, starPts, polygonSides]);

  const selectedElement = elements.find((el) => el.id === selectedId);

  const renderElement = (el: DrawElement) => {
    const isSel = el.id === selectedId;
    const cp: Record<string, unknown> = { key: el.id, id: el.id, fill: el.fill, stroke: isSel ? '#f59e0b' : el.stroke, strokeWidth: isSel ? el.strokeWidth + 2 : el.strokeWidth, opacity: el.opacity, style: { cursor: tool === 'select' ? 'move' : undefined } };
    switch (el.type) {
      case 'rect': return <rect {...cp} x={el.x} y={el.y} width={Math.abs(el.width)} height={Math.abs(el.height)} rx="2" />;
      case 'circle': return <circle {...cp} cx={el.x + el.width / 2} cy={el.y + el.height / 2} r={Math.abs(el.width) / 2} />;
      case 'ellipse': return <ellipse {...cp} cx={el.x + el.width / 2} cy={el.y + el.height / 2} rx={Math.abs(el.width / 2)} ry={Math.abs(el.height / 2)} />;
      case 'diamond': return <polygon {...cp} points={genDiamondPts(el.x + el.width / 2, el.y + el.height / 2, el.width, el.height)} />;
      case 'star': return <polygon {...cp} points={genStarPts(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, Math.min(el.width, el.height) / 4, starPts)} />;
      case 'polygon': return <polygon {...cp} points={genPolyPts(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, polygonSides)} />;
      case 'line': return <line {...cp} x1={el.x} y1={el.y} x2={el.x2 || el.x + 100} y2={el.y2 || el.y + 100} strokeLinecap="round" />;
      case 'arrow': return <line {...cp} x1={el.x} y1={el.y} x2={el.x2 || el.x + 100} y2={el.y2 || el.y + 100} strokeLinecap="round" markerEnd="url(#arrowhead)" />;
      case 'path': return <path {...cp} d={el.pathData || ''} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      case 'text': return <text {...cp} x={el.x} y={el.y} fontSize={el.fontSize || 24} fontFamily={el.fontFamily || 'system-ui, sans-serif'} dominantBaseline="hanging" style={{ cursor: 'pointer' }}>{el.text || 'Text'}</text>;
      default: return null;
    }
  };

  const renderResizeHandles = () => {
    if (!selectedElement || selectedElement.type === 'path') return null;
    const { x, y, width, height } = selectedElement;
    const w = Math.abs(width), h = Math.abs(height) || (selectedElement.fontSize || 24);
    const hs = [
      { p: 'nw', cx: x, cy: y }, { p: 'ne', cx: x + w, cy: y }, { p: 'sw', cx: x, cy: y + h }, { p: 'se', cx: x + w, cy: y + h },
      { p: 'n', cx: x + w / 2, cy: y }, { p: 's', cx: x + w / 2, cy: y + h }, { p: 'e', cx: x + w, cy: y + h / 2 }, { p: 'w', cx: x, cy: y + h / 2 },
    ];
    return hs.map((h) => (
      <circle key={`h-${h.p}`} id={`handle-${h.p}`} data-handle={h.p} cx={h.cx} cy={h.cy} r={5} fill="#f59e0b" stroke="white" strokeWidth={2} style={{ cursor: `${h.p}-resize` }} pointerEvents="all" />
    ));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-3 h-full min-h-[500px] animate-fade-in">
      {/* Tools sidebar */}
      <div className="xl:w-52 flex flex-row xl:flex-col gap-1 p-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto xl:overflow-visible shrink-0">
        <h3 className="hidden xl:block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 px-1">Draw Tools</h3>
        <div className="flex flex-row xl:flex-col gap-1">
          {tools.map((t) => (
            <button key={t.key} onClick={() => { setTool(t.key); setSelectedId(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap font-medium ${tool === t.key ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50 shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              <span className="text-base">{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="hidden xl:block w-full h-px bg-gray-200 dark:bg-gray-700 my-1.5" />
        <div className="flex flex-row xl:flex-col gap-1">
          <button onClick={handleDrawUndo} disabled={drawHistoryIdx <= 0} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">↩ Undo</button>
          <button onClick={handleDrawRedo} disabled={drawHistoryIdx >= drawHistory.length - 1} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">↪ Redo</button>
        </div>
        {selectedId && (<>
          <div className="hidden xl:block w-full h-px bg-gray-200 dark:bg-gray-700 my-1.5" />
          <h3 className="hidden xl:block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 px-1">Selected</h3>
          <div className="flex flex-row xl:flex-col gap-1">
            <button onClick={handleDuplicate} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors">📋 Duplicate</button>
            <button onClick={handleBringToFront} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">⬆ Front</button>
            <button onClick={handleSendToBack} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">⬇ Back</button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-colors">🗑 Delete</button>
          </div>
        </>)}
        <div className="hidden xl:block mt-2">
          <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Presets</h3>
          <div className="flex flex-wrap gap-1.5 px-1">
            {['#ef4444','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f97316','#1e1e1e','#ffffff'].map((c) => (
              <button key={c} onClick={() => setFill(c)} className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button onClick={handleDrawUndo} disabled={drawHistoryIdx <= 0} className="p-1.5 rounded-md disabled:opacity-30 hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400" title="Undo (Ctrl+Z)">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" /></svg>
            </button>
            <button onClick={handleDrawRedo} disabled={drawHistoryIdx >= drawHistory.length - 1} className="p-1.5 rounded-md disabled:opacity-30 hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400" title="Redo (Ctrl+Shift+Z)">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" /></svg>
            </button>
          </div>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
          <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
            <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} className="w-3.5 h-3.5 rounded accent-indigo-500" /> Snap
          </label>
          {selectedElement && (<>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400">Opacity</label>
              <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity}
                onChange={(e) => updateElements((p) => p.map((el) => el.id === selectedId ? { ...el, opacity: Number(e.target.value) } : el))} className="w-20 accent-indigo-500" />
              <span className="text-[10px] text-gray-400 font-mono w-8">{(selectedElement.opacity * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400">Rotate</label>
              <input type="range" min="0" max="360" value={selectedElement.rotation}
                onChange={(e) => updateElements((p) => p.map((el) => el.id === selectedId ? { ...el, rotation: Number(e.target.value) } : el))} className="w-20 accent-indigo-500" />
              <span className="text-[10px] text-gray-400 font-mono w-8">{selectedElement.rotation}°</span>
            </div>
          </>)}
          <div className="flex-1" />
          {selectedElement && <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-semibold capitalize">{selectedElement.type}</span>}
          <span className="text-[10px] text-gray-400">Double-click text to edit</span>
        </div>

        <div className="flex-1 overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-inner" style={{ cursor: cursorMap[tool] }}>
          <svg ref={svgRef} id="draw-canvas" className="w-full h-full" viewBox={`0 0 ${canvasW} ${canvasH}`} style={{ minHeight: '400px' }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick}
            onMouseLeave={() => {
              if (isDrawing && tool === 'path' && pathPoints.length > 2) {
                const pd = pointsToSmoothPath(pathPoints);
                const id = `path-${Date.now()}`;
                updateElements((p) => [...p, { id, type: 'path', x: 0, y: 0, width: 0, height: 0, fill: 'none', stroke: strokeColor, strokeWidth, opacity: 1, rotation: 0, pathData: pd }]);
                setSelectedId(id);
              }
              setIsDrawing(false); setIsDragging(false); setIsResizing(false); setPathPoints([]); setDrawStart(null);
            }}>
            <defs>
              <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse"><path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#d1d5db" strokeWidth="0.5" /></pattern>
              <pattern id="grid-dark" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse"><path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#374151" strokeWidth="0.5" /></pattern>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="context-stroke" /></marker>
            </defs>
            <rect id="grid-rect" width={canvasW} height={canvasH} fill="white" className="dark:hidden" />
            <rect id="grid-rect-dark" width={canvasW} height={canvasH} fill="#111827" className="hidden dark:block" />
            <rect width={canvasW} height={canvasH} fill="url(#grid)" className="dark:hidden" />
            <rect width={canvasW} height={canvasH} fill="url(#grid-dark)" className="hidden dark:block" />
            {isDrawing && tool === 'path' && pathPoints.length > 1 && (
              <path d={pointsToSmoothPath(pathPoints)} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} opacity="0.7" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {elements.map(renderElement)}
            {selectedElement && selectedElement.type !== 'path' && (() => {
              const w = Math.abs(selectedElement.width) || 60;
              const h = Math.abs(selectedElement.height) || (selectedElement.fontSize || 24);
              return (<>
                <rect x={selectedElement.x - 6} y={selectedElement.y - 6} width={w + 12} height={h + 12} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" rx="3" pointerEvents="none" />
                {renderResizeHandles()}
              </>);
            })()}
          </svg>
        </div>

        {/* Properties bar */}
        <div className="flex flex-wrap items-center gap-2.5 mt-2 px-3 py-2.5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5"><label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fill</label><input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" /></div>
          <div className="flex items-center gap-1.5"><label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Stroke</label><input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" /></div>
          <div className="flex items-center gap-1.5"><label className="text-xs text-gray-500 dark:text-gray-400 font-medium">SW</label><input type="number" value={strokeWidth} onChange={(e) => setStrokeWidth(Math.max(0, Number(e.target.value)))} className="w-14 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50" min="0" /></div>
          <div className="flex items-center gap-1.5"><label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Font</label><input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(8, Number(e.target.value)))} className="w-14 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50" min="8" max="200" /></div>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
          <div className="flex items-center gap-1.5"><label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sides</label><input type="number" value={polygonSides} onChange={(e) => setPolygonSides(Math.max(3, Math.min(12, Number(e.target.value))))} className="w-14 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50" min="3" max="12" /></div>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
          <div className="flex items-center gap-1.5"><label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Canvas</label><input type="number" value={canvasW} onChange={(e) => setCanvasW(Math.max(100, Number(e.target.value)))} className="w-16 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50" min="100" /><span className="text-gray-400 text-xs">×</span><input type="number" value={canvasH} onChange={(e) => setCanvasH(Math.max(100, Number(e.target.value)))} className="w-16 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50" min="100" /></div>
          {selectedElement && selectedElement.type === 'text' && (<>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
            <input type="text" value={selectedElement.text || ''} onChange={(e) => updateElements((p) => p.map((el) => el.id === selectedElement.id ? { ...el, text: e.target.value } : el))} className="w-40 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50" placeholder="Edit text..." />
          </>)}
          <div className="flex-1" />
          <span className="text-xs text-gray-400 font-medium">{elements.length} el</span>
          <button onClick={() => { updateElements(() => []); setSelectedId(null); }} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium transition-colors">Clear</button>
          <button onClick={handleExport} disabled={elements.length === 0} className="px-4 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium disabled:opacity-40 shadow-sm transition-colors">📤 Export SVG</button>
        </div>

        {/* Layers */}
        {elements.length > 0 && (
          <div className="mt-2 p-2.5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 px-1">Layers ({elements.length})</h3>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {[...elements].reverse().map((el) => (
                <button key={el.id} onClick={() => { setSelectedId(el.id); setTool('select'); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${selectedId === el.id ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  <span className="capitalize">{el.type}</span>
                  {el.text && <span className="opacity-50 truncate max-w-[60px]">"{el.text}"</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text Modal */}
      {textModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{editingTextId ? '✏️ Edit Text' : '🔤 Add Text'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {editingTextId ? 'Update the text content' : `Position (${textPosition ? Math.round(textPosition.x) : 0}, ${textPosition ? Math.round(textPosition.y) : 0})`}
            </p>
            <input ref={textInputRef} type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTextConfirm(); if (e.key === 'Escape') handleTextCancel(); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3" placeholder="Type your text here..." />
            {textInput && (
              <div className="px-4 py-3 mb-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" style={{ fontFamily, fontSize: Math.min(fontSize, 28) + 'px', color: fill }}>
                {textInput}
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2"><label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Color</label><input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" /></div>
              {!editingTextId && <div className="flex items-center gap-2"><label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Size</label><input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(8, Number(e.target.value)))} className="w-20 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" min="8" max="200" /></div>}
            </div>
            <div className="mb-4">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5 block">Font</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="system-ui, sans-serif">System Default</option>
                <option value="'Noto Sans Devanagari', sans-serif">हिन्दी (Hindi)</option>
                <option value="'Noto Sans', sans-serif">Noto Sans (Multi)</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Noto Serif Devanagari', serif">हिन्दी Serif</option>
                <option value="'Caveat', cursive">Caveat (Handwritten)</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Playfair Display', serif">Playfair Display</option>
                <option value="monospace">Monospace</option>
                <option value="serif">Serif</option>
                <option value="cursive">Cursive</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleTextCancel} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-sm transition-colors">Cancel</button>
              <button onClick={handleTextConfirm} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all">{editingTextId ? '✓ Update Text' : '✓ Add Text'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
