import React, { useState } from 'react';
import {
  Hash,
  Lock,
  Send,
  Paperclip,
  Smile,
  Users,
  Search,
  FileText,
  MessageSquare,
  Sparkles,
  Bot
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const CollaborationView: React.FC = () => {
  const {
    channels,
    activeChannel,
    setActiveChannel,
    messages,
    sendMessage,
    currentUser,
    workspaces
  } = useNexus();

  const [inputMessage, setInputMessage] = useState('');

  const channelMessages = messages.filter((m) => m.channelId === activeChannel.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage.trim());
    setInputMessage('');
  };

  return (
    <div className="flex h-full overflow-hidden animate-in fade-in duration-200">
      {/* Channels Sidebar */}
      <div className="w-64 bg-slate-950/80 border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Channels & DMs
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Live
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Public Channels
            </div>
            <div className="space-y-0.5">
              {channels.map((ch) => {
                const isActive = activeChannel.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {ch.type === 'private' ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{ch.name}</span>
                    </div>
                    {ch.unreadCount && ch.unreadCount > 0 ? (
                      <span className="text-[10px] font-bold px-1.5 rounded-full bg-rose-500 text-white">
                        {ch.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Direct Messages
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-900 cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Alex Mercer</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-900 cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Elena Rostova</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-900 cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Marcus Vance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b0f17]">
        {/* Channel Header */}
        <div className="h-14 px-6 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">{activeChannel.name}</h3>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400 truncate max-w-md">
              {activeChannel.description}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-4 h-4" />
            <span>{activeChannel.membersCount} members</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Simulated automated integration message */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3 text-xs">
            <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-mono text-[11px]">
              [10:32] System: PR #142 "Circuit Breaker Implementation" was automatically linked to TASK-101.
            </span>
          </div>

          {channelMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3.5 group">
              <img
                src={msg.sender.avatar}
                alt={msg.sender.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-800"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">{msg.sender.name}</span>
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {msg.sender.role}
                  </span>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-2xl rounded-tl-sm border border-slate-800/80 inline-block max-w-2xl">
                  {msg.content}

                  {/* Attachments if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span className="font-semibold text-slate-300">{msg.attachments[0].name}</span>
                      <span className="text-[10px] text-slate-500">({msg.attachments[0].size})</span>
                    </div>
                  )}
                </div>

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {msg.reactions.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1"
                      >
                        <span>{r.emoji}</span>
                        <span className="font-bold text-[10px]">{r.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Composer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              placeholder={`Message #${activeChannel.name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-full pl-4 pr-24 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1.5">
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
