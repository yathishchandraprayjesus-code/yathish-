import React, { useState } from 'react';
import { ArtifactData } from '../types';
import {
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  X,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface ArtifactViewerProps {
  artifact: ArtifactData;
  onClose: () => void;
}

export function ArtifactViewer({ artifact, onClose }: ArtifactViewerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext =
      artifact.type === 'svg'
        ? 'svg'
        : artifact.type === 'html'
        ? 'html'
        : artifact.type === 'markdown'
        ? 'md'
        : artifact.type === 'react'
        ? 'tsx'
        : 'txt';
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build sandboxed HTML preview for React / HTML
  const generatePreviewHtml = () => {
    if (artifact.type === 'svg') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #faf9f6; font-family: sans-serif; }
            svg { max-width: 100%; height: auto; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.06); border-radius: 8px; background: white; }
          </style>
        </head>
        <body>
          ${artifact.content}
        </body>
        </html>
      `;
    }

    if (artifact.type === 'html') {
      return artifact.content;
    }

    if (artifact.type === 'react') {
      // Clean up export and imports for in-browser Babel execution
      const cleanCode = artifact.content
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function App')
        .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, 'const App = $1;');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { margin: 0; padding: 16px; background: #fdfdfd; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect, useRef, useMemo } = React;
            ${cleanCode}
            const root = ReactDOM.createRoot(document.getElementById('root'));
            if (typeof App !== 'undefined') {
              root.render(<App />);
            } else {
              document.getElementById('root').innerHTML = '<div style="padding: 20px; color: #666;">Component loaded. Check the Code tab to inspect source.</div>';
            }
          </script>
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; padding: 24px; line-height: 1.6; color: #333; background: #faf9f6;">
        <pre style="white-space: pre-wrap; font-family: monospace;">${escapeHtml(artifact.content)}</pre>
      </body>
      </html>
    `;
  };

  const lines = artifact.content.split('\n');

  return (
    <aside
      className={`flex flex-col border-l border-stone-200 bg-white transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-full h-full'
          : 'w-full lg:w-[480px] xl:w-[560px] h-full'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-[#fbfbfa] px-4 py-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#cc785c]/10 text-[#cc785c]">
            <FileCode className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <h4 className="truncate text-xs font-semibold text-stone-900">{artifact.title}</h4>
            <div className="flex items-center gap-2">
              <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[10px] font-mono text-stone-600 uppercase">
                {artifact.type}
              </span>
              <span className="text-[11px] text-stone-400">
                {lines.length} lines • {Math.round(artifact.content.length / 1024 * 10) / 10} KB
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          {/* Tab switcher */}
          <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-all ${
                activeTab === 'code'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" /> Code
            </button>
          </div>

          <div className="mx-1 h-4 w-px bg-stone-200" />

          <button
            onClick={handleCopy}
            title="Copy code"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownload}
            title="Download file"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            title="Close artifact"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-hidden relative bg-[#faf9f6]">
        {activeTab === 'preview' ? (
          <iframe
            title="Artifact Preview Sandbox"
            srcDoc={generatePreviewHtml()}
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="h-full w-full border-none bg-white"
          />
        ) : (
          <div className="h-full overflow-auto bg-[#1e1e1e] p-4 text-xs font-mono text-stone-200">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="w-10 select-none pr-4 text-right text-stone-600 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre font-mono text-[12px] leading-5 text-stone-300">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </aside>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
