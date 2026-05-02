export type Mode = 'editor' | 'draw' | 'customize' | 'code';
export type DrawTool = 'select' | 'rect' | 'circle' | 'ellipse' | 'line' | 'path' | 'text' | 'star' | 'polygon' | 'arrow' | 'diamond';
export type CodeLanguage = 'react' | 'react-native' | 'html';

export interface DrawElement {
  id: string;
  type: DrawTool;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  pathData?: string;
  x2?: number;
  y2?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface SvgElementInfo {
  id: string;
  tag: string;
  attributes: Record<string, string>;
}
