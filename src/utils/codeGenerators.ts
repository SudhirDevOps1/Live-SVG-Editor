function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
}

function buildProps(attrs: NamedNodeMap): string {
  const props: string[] = [];
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.name === 'class') {
      props.push(`className="${attr.value}"`);
    } else {
      props.push(`${kebabToCamel(attr.name)}="${attr.value}"`);
    }
  }
  return props.join(' ');
}

function elementToJsx(el: Element, indent: number): string {
  const pad = '  '.repeat(indent);
  const tag = el.tagName.toLowerCase();
  const props = buildProps(el.attributes);
  const selfClosing = ['path', 'circle', 'ellipse', 'line', 'rect', 'use', 'stop', 'image'].includes(tag);

  const children = Array.from(el.childNodes)
    .map((child) => {
      if (child.nodeType === 3) return child.textContent?.trim() || '';
      if (child.nodeType === 1) return elementToJsx(child as Element, indent + 1);
      return '';
    })
    .filter(Boolean);

  if (selfClosing) {
    return `${pad}<${tag} ${props} />`;
  }
  if (children.length === 0) {
    return `${pad}<${tag} ${props}></${tag}>`;
  }
  return `${pad}<${tag} ${props}>\n${children.join('\n')}\n${pad}</${tag}>`;
}

export function svgToReactComponent(svgCode: string, componentName = 'SvgIcon'): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return '// Invalid SVG code';

  const jsx = elementToJsx(svg, 1);

  return `import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

const ${componentName}: React.FC<Props> = ({ className, size = 24 }) => (
${jsx
  .replace(/width="[^"]*"/, 'width={size}')
  .replace(/height="[^"]*"/, 'height={size}')}
);

export default ${componentName};`;
}

export function svgToReactNative(svgCode: string, componentName = 'SvgIcon'): string {
  const tagMap: Record<string, string> = {
    svg: 'Svg',
    rect: 'Rect',
    circle: 'Circle',
    ellipse: 'Ellipse',
    line: 'Line',
    path: 'Path',
    text: 'Text',
    g: 'G',
    defs: 'Defs',
    stop: 'Stop',
    linearGradient: 'LinearGradient',
    radialGradient: 'RadialGradient',
    use: 'Use',
    clipPath: 'ClipPath',
    mask: 'Mask',
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return '// Invalid SVG code';

  function convertElement(element: Element, indent: number): string {
    const pad = '  '.repeat(indent);
    const tag = element.tagName.toLowerCase();
    const rnTag = tagMap[tag] || tag;
    const props: string[] = [];
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name === 'xmlns' || attr.name === 'version') continue;
      props.push(`${kebabToCamel(attr.name)}="${attr.value}"`);
    }
    const children = Array.from(element.childNodes)
      .map((child) => {
        if (child.nodeType === 1) return convertElement(child as Element, indent + 1);
        if (child.nodeType === 3) return child.textContent?.trim() || '';
        return '';
      })
      .filter(Boolean);

    if (children.length === 0) {
      return `${pad}<${rnTag} ${props.join(' ')} />`;
    }
    return `${pad}<${rnTag} ${props.join(' ')}>\n${children.join('\n')}\n${pad}</${rnTag}>`;
  }

  const rnSvg = convertElement(svg, 1);

  return `import React from 'react';
import Svg, { Circle, Ellipse, G, Text as SvgText, Rect, Path, Line, LinearGradient, Stop, Defs, ClipPath, RadialGradient, Use, Mask } from 'react-native-svg';

const ${componentName} = () => (
${rnSvg}
);

export default ${componentName};`;
}

export function svgToHtml(svgCode: string, title = 'SVG Image'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${svgCode}
</body>
</html>`;
}
