interface SvgPreviewProps {
  svgCode: string;
  zoom: number;
  rotation: number;
}

export function SvgPreview({ svgCode, zoom, rotation }: SvgPreviewProps) {
  const sanitized = svgCode
    .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');

  return (
    <div className="flex items-center justify-center w-full h-full overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      style={{
        backgroundImage:
          'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      }}
    >
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </div>
  );
}
