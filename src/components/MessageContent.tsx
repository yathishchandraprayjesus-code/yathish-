import React, { useState } from 'react';
import { Download, Maximize2, ExternalLink, Copy, Check, Terminal, Code2 } from 'lucide-react';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Parse markdown images: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

  // Split content by images
  const parts: (string | { type: 'image'; alt: string; url: string })[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({
      type: 'image',
      alt: match[1] || 'AI Generated Photo',
      url: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  // Helper to format inline spans: bold, code, inline math, bracket citations [1][2]
  const renderInline = (text: string) => {
    // Regex for inline code `...`, inline math \(...\), citation [1], bold **...**
    const inlineRegex = /(`[^`]+`|\\\([\s\S]*?\\\)|\[\d+\]|\*\*[^*]+\*\*)/g;
    const tokens = text.split(inlineRegex);

    return tokens.map((token, i) => {
      if (!token) return null;

      // Inline code
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        return (
          <code
            key={i}
            className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[12px] text-stone-800 border border-stone-200"
          >
            {token.slice(1, -1)}
          </code>
        );
      }

      // Inline LaTeX math \( ... \)
      if (token.startsWith('\\(') && token.endsWith('\\)')) {
        const mathContent = token.slice(2, -2).trim();
        return (
          <span
            key={i}
            className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50/80 font-mono text-[12.5px] text-amber-950 border border-amber-200/80 mx-0.5"
            title="LaTeX Math Expression"
          >
            {mathContent}
          </span>
        );
      }

      // Bracket Citation e.g. [1], [2]
      if (/^\[\d+\]$/.test(token)) {
        const citationNum = token.slice(1, -1);
        return (
          <span
            key={i}
            className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-teal-50 text-teal-800 font-mono text-[10px] font-bold border border-teal-200/90 mx-0.5 align-top cursor-default shadow-2xs hover:bg-teal-100 transition-colors"
            title={`Source Citation [${citationNum}]`}
          >
            {citationNum}
          </span>
        );
      }

      // Bold text **...**
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return (
          <strong key={i} className="font-semibold text-stone-900">
            {token.slice(2, -2)}
          </strong>
        );
      }

      return <React.Fragment key={i}>{token}</React.Fragment>;
    });
  };

  // Structured block renderer
  const renderTextBlocks = (rawText: string) => {
    // Strip extracted antArtifact tags
    const cleanText = rawText.replace(/<antArtifact[\s\S]*?<\/antArtifact>/gi, '').trim();
    if (!cleanText) return null;

    const lines = cleanText.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    let codeBlockCounter = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced Code Block: ```lang
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim() || 'code';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const fullCode = codeLines.join('\n');
        const blockIdx = codeBlockCounter++;

        elements.push(
          <div
            key={`code-${blockIdx}`}
            className="my-3 overflow-hidden rounded-xl border border-stone-800 bg-[#141414] shadow-sm font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-stone-800 bg-[#1e1e1e] px-4 py-2">
              <div className="flex items-center gap-2 text-stone-400">
                <Terminal className="h-3.5 w-3.5 text-[#cc785c]" />
                <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                  {lang}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(fullCode, blockIdx)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition"
              >
                {copiedCodeIdx === blockIdx ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed text-stone-200">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Display Block Math: \[ ... \]
      if (line.trim().startsWith('\\[') || line.trim() === '\\[') {
        const mathLines: string[] = [];
        if (line.trim() !== '\\[') {
          mathLines.push(line.trim().replace(/^\\\[/, ''));
        }
        i++;
        while (i < lines.length && !lines[i].includes('\\]')) {
          mathLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          mathLines.push(lines[i].replace(/\\\][\s\S]*$/, ''));
          i++;
        }
        const mathFormula = mathLines.join('\n').trim();

        elements.push(
          <div
            key={`math-${i}`}
            className="my-3 rounded-xl border border-amber-200/90 bg-amber-50/50 p-4 text-center font-mono text-sm text-stone-900 shadow-2xs overflow-x-auto"
          >
            <div className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold mb-1">
              Mathematical Derivation
            </div>
            <div className="font-semibold text-[13.5px] leading-relaxed text-stone-900">
              {mathFormula}
            </div>
          </div>
        );
        continue;
      }

      // Markdown Table: lines starting with |
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerRow = tableLines[0]
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());
          const bodyRows = tableLines
            .slice(2) // skip separator row (|---|---|)
            .map((row) =>
              row
                .slice(1, -1)
                .split('|')
                .map((c) => c.trim())
            );

          elements.push(
            <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-700">
                    {headerRow.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2.5 font-bold">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bodyRows.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-stone-50/60 transition-colors">
                      {r.map((c, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-stone-800">
                          {renderInline(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Level 2 Header: ## Title
      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="mt-5 mb-2 font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-1"
          >
            {renderInline(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }

      // Level 3 Header: ### Title
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="mt-4 mb-1.5 font-sans text-sm font-bold text-stone-900">
            {renderInline(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      // Blockquote: > Quote
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            className="my-2 border-l-3 border-[#cc785c] pl-3 py-1 text-xs italic text-stone-600 bg-stone-50/60 rounded-r-lg"
          >
            {renderInline(line.slice(2))}
          </blockquote>
        );
        i++;
        continue;
      }

      // Unordered List: - item or * item
      if (/^[-*]\s+/.test(line)) {
        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2 my-1 text-xs leading-relaxed text-stone-800">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
            <span className="flex-1">{renderInline(line.replace(/^[-*]\s+/, ''))}</span>
          </div>
        );
        i++;
        continue;
      }

      // Ordered List: 1. item
      if (/^\d+\.\s+/.test(line)) {
        const num = line.match(/^(\d+)\.\s+/)?.[1] || '1';
        elements.push(
          <div key={`oli-${i}`} className="flex items-start gap-2 my-1 text-xs leading-relaxed text-stone-800">
            <span className="font-mono text-[11px] font-bold text-stone-500 shrink-0 w-4">{num}.</span>
            <span className="flex-1">{renderInline(line.replace(/^\d+\.\s+/, ''))}</span>
          </div>
        );
        i++;
        continue;
      }

      // Empty line / paragraph break
      if (!line.trim()) {
        elements.push(<div key={`sp-${i}`} className="h-2" />);
        i++;
        continue;
      }

      // Standard prose line
      elements.push(
        <p key={`p-${i}`} className="my-1 text-xs leading-relaxed text-stone-800">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return <div className="space-y-0.5">{elements}</div>;
  };

  return (
    <div className="space-y-3">
      {parts.map((part, idx) => {
        if (typeof part === 'string') {
          return <React.Fragment key={idx}>{renderTextBlocks(part)}</React.Fragment>;
        }

        // Render Image with Preview & Download
        return (
          <div
            key={idx}
            className="my-3 overflow-hidden rounded-xl border border-stone-200 bg-black/95 shadow-md transition-all group relative max-w-xl"
          >
            <div className="relative overflow-hidden flex items-center justify-center min-h-[220px]">
              <img
                src={part.url}
                alt={part.alt}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="max-h-[440px] w-full object-contain rounded-t-xl transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setSelectedImage(part.url)}
                  className="rounded-lg bg-stone-900/80 backdrop-blur-xs p-1.5 text-white hover:bg-black transition shadow"
                  title="View full resolution"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <a
                  href={part.url}
                  download="realistic-ai-photo.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-[#cc785c] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#b8654a] transition shadow"
                  title="Download image"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
            {part.alt && part.alt !== 'AI Generated Photo' && (
              <div className="bg-stone-900 px-3.5 py-2 text-[11px] text-stone-300 border-t border-stone-800 flex items-center justify-between">
                <span className="truncate">{part.alt}</span>
                <span className="text-[10px] font-mono text-amber-400 shrink-0">8K FLUX.1 Photorealism</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <img
              src={selectedImage}
              alt="Full size view"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] w-auto object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 rounded-full bg-stone-800/80 p-2 text-white hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
