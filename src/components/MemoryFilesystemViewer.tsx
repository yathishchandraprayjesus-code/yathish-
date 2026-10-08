import React, { useState } from 'react';
import { MemoryFile } from '../types';
import {
  FolderTree,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Check,
  ShieldCheck,
  History,
  Lock,
  Database,
} from 'lucide-react';

interface MemoryFilesystemViewerProps {
  files: MemoryFile[];
  onUpdateFile: (file: MemoryFile) => void;
  onCreateFile: (file: MemoryFile) => void;
  onDeleteFile: (path: string) => void;
}

export function MemoryFilesystemViewer({
  files,
  onUpdateFile,
  onCreateFile,
  onDeleteFile,
}: MemoryFilesystemViewerProps) {
  const [selectedPath, setSelectedPath] = useState<string>(files[0]?.path || '/profile.md');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newFilePath, setNewFilePath] = useState('/topics/hobbies.md');
  const [newFileDesc, setNewFileDesc] = useState('User leisure interests and recurring activities');

  const activeFile = files.find((f) => f.path === selectedPath) || files[0];

  const handleStartEdit = () => {
    if (!activeFile) return;
    setEditContent(activeFile.content.join('\n'));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!activeFile) return;
    const updated: MemoryFile = {
      ...activeFile,
      content: editContent.split('\n'),
      version: 'v' + Math.random().toString(36).substring(2, 10),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateFile(updated);
    setIsEditing(false);
  };

  const handleCreate = () => {
    if (!newFilePath.trim()) return;
    const name = newFilePath.split('/').pop()?.replace('.md', '') || 'item';
    const newFile: MemoryFile = {
      path: newFilePath.trim(),
      name,
      description: newFileDesc.trim() || 'Durable user context document',
      sources: ['chat'],
      version: 'v' + Math.random().toString(36).substring(2, 10),
      updatedAt: new Date().toISOString().split('T')[0],
      content: [
        '---',
        `name: ${name}`,
        `description: ${newFileDesc.trim() || 'Durable context'}`,
        'sources: [chat]',
        '---',
        '',
        `- [stated] initial durable fact noted for ${name}`,
      ],
    };
    onCreateFile(newFile);
    setSelectedPath(newFile.path);
    setIsCreating(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#faf9f6]">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[#cc785c]" />
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Persistent Memory Filesystem
              </h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                Active Protocol
              </span>
            </div>
            <p className="mt-0.5 text-xs text-stone-500">
              Virtual memory layer providing cross-session continuity using durable <code>[stated]</code> facts, frontmatter schemas, and privacy isolation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Memory Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Tree Browser */}
        <div className="w-72 border-r border-stone-200 bg-white p-4 overflow-y-auto">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Virtual Memory Tree
            </span>
            <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[10px] font-mono text-stone-600">
              {files.length} files
            </span>
          </div>

          <div className="space-y-1">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => {
                  setSelectedPath(file.path);
                  setIsEditing(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all ${
                  selectedPath === file.path
                    ? 'bg-amber-50/70 border border-amber-200/80 font-medium text-[#cc785c]'
                    : 'text-stone-700 hover:bg-stone-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                  <span className="truncate font-mono text-[11px]">{file.path}</span>
                </div>
                <span className="text-[10px] font-mono text-stone-400 shrink-0">
                  {file.version.substring(0, 5)}
                </span>
              </button>
            ))}
          </div>

          {/* Privacy Rules Reminder Card */}
          <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Privacy Boundary</span>
            </div>
            <p className="mt-1.5 text-[11px] text-stone-500 leading-relaxed">
              Never filed in memory: sensitive identification numbers, financial account digits, health diagnoses, or criminal history. Only user-stated durable facts are retained.
            </p>
          </div>
        </div>

        {/* Right Document Viewer & Editor */}
        <div className="flex-1 overflow-auto bg-white p-6">
          {isCreating ? (
            <div className="max-w-xl rounded-xl border border-stone-200 bg-stone-50/40 p-5">
              <h3 className="font-serif text-base font-semibold text-stone-900">
                Create New Memory File
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Must follow the standardized path taxonomy: <code>/topics/&lt;domain&gt;.md</code> or <code>/areas/&lt;name&gt;.md</code>.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-stone-700">File Path</label>
                  <input
                    type="text"
                    value={newFilePath}
                    onChange={(e) => setNewFilePath(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-mono text-xs text-stone-800 focus:border-[#cc785c] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700">Description (Frontmatter)</label>
                  <input
                    type="text"
                    value={newFileDesc}
                    onChange={(e) => setNewFileDesc(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-800 focus:border-[#cc785c] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="rounded-lg bg-[#cc785c] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#b8654a]"
                  >
                    Create File
                  </button>
                </div>
              </div>
            </div>
          ) : activeFile ? (
            <div className="h-full flex flex-col">
              {/* Document Meta Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-stone-900">
                      {activeFile.path}
                    </span>
                    <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[10px] font-mono text-stone-600">
                      ver: {activeFile.version}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-500">{activeFile.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleStartEdit}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-stone-500" />
                        <span>Edit Document</span>
                      </button>
                      {activeFile.path !== '/profile.md' && (
                        <button
                          onClick={() => onDeleteFile(activeFile.path)}
                          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete memory document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 rounded-lg bg-[#cc785c] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#b8654a]"
                      >
                        <Check className="h-3.5 w-3.5" /> Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Text Body */}
              <div className="flex-1 overflow-auto">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="h-full w-full rounded-xl border border-stone-300 bg-stone-50/30 p-4 font-mono text-xs text-stone-800 leading-relaxed focus:border-[#cc785c] focus:outline-hidden"
                  />
                ) : (
                  <div className="rounded-xl border border-stone-200 bg-[#fdfdfd] p-5 shadow-2xs">
                    <pre className="font-mono text-xs leading-relaxed text-stone-800 whitespace-pre-wrap">
                      {activeFile.content.join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-stone-400">
              Select or create a memory document to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
