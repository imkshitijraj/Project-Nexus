import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Plus,
  Edit3,
  Eye,
  Tag,
  Clock,
  User,
  Share2,
  Check
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const DocsView: React.FC = () => {
  const { documents, activeDocument, setActiveDocument, showToast } = useNexus();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(activeDocument?.content || '');

  const handleSelectDoc = (doc: any) => {
    setActiveDocument(doc);
    setContent(doc.content);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (activeDocument) {
      activeDocument.content = content;
      showToast('Document saved successfully');
      setIsEditing(false);
    }
  };

  if (!activeDocument) return null;

  return (
    <div className="flex h-full overflow-hidden animate-in fade-in duration-200">
      {/* Docs Sidebar */}
      <div className="w-72 bg-slate-950/80 border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Knowledge Base
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {documents.length} RFCs
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {documents.map((doc) => {
            const isActive = activeDocument.id === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{doc.version}</span>
                </div>
                <div className="text-xs font-semibold truncate">{doc.title}</div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>Updated {doc.lastUpdated}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Document Viewer/Editor */}
      <div className="flex-1 flex flex-col bg-[#0b0f17] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-500/10">
                {activeDocument.version}
              </span>
              <h2 className="text-lg font-bold text-white">{activeDocument.title}</h2>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Author: {activeDocument.author.name}</span>
              </div>
              <span>•</span>
              <span>Category: {activeDocument.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit RFC</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          {isEditing ? (
            <textarea
              rows={24}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-4 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          ) : (
            <div className="prose prose-invert prose-indigo max-w-none text-slate-200 text-xs leading-relaxed space-y-4">
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs whitespace-pre-wrap font-sans">
                {activeDocument.content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
