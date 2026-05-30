// Block types stored as JSON in the content field
export type TextBlock = {
  id: string;
  type: 'text';
  content: string;
};

export type ImageBlock = {
  id: string;
  type: 'image';
  url: string;
  alt?: string;
  caption?: string;
};

export type YouTubeBlock = {
  id: string;
  type: 'youtube';
  url: string;
  label?: string;
};

export type Block = TextBlock | ImageBlock | YouTubeBlock;

// Parse content field — handles both new JSON blocks and legacy plain text
export function parseBlocks(content: string): Block[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy plain text — wrap in a single text block
    return [{ id: 'legacy', type: 'text', content }];
  }
  return [];
}

// Convert our simple markup to HTML for text blocks
// Supports: **bold**, *italic*, ## h2, ### h3, - bullet
export function renderTextContent(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  const htmlLines: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw;

    // Headings
    if (line.startsWith('### ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
    // Bullet
    } else if (line.startsWith('- ')) {
      if (!inList) { htmlLines.push('<ul>'); inList = true; }
      htmlLines.push(`<li>${inlineFormat(line.slice(2))}</li>`);
    // Empty line
    } else if (line.trim() === '') {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push('');
    // Normal paragraph line
    } else {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<p>${inlineFormat(line)}</p>`);
    }
  }

  if (inList) htmlLines.push('</ul>');
  return htmlLines.join('\n');
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>');
}
