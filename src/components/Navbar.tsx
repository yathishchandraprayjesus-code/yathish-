import React from 'react';
import {
  MessageSquare,
  FileCode2,
  Database,
  Wrench,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Smartphone,
  Brain,
  Video,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'chat' | 'prompt' | 'memory' | 'skills' | 'evolution' | 'studio';
  setActiveTab: (tab: 'chat' | 'prompt' | 'memory' | 'skills' | 'evolution' | 'studio') => void;
  onNewChat: () => void;
  onOpenMobileModal: () => void;
  temperature: number;
  setTemperature: (t: number) => void;
  hasApiKey: boolean;
  currentUser?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onNewChat,
  onOpenMobileModal,
  temperature,
  setTemperature,
  hasApiKey,
  currentUser,
  onSignIn,
  onSignOut,
}: NavbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-stone-200 bg-[#fbfbfa] px-4">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cc785c] text-white shadow-xs">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-sm font-semibold tracking-tight text-stone-900">
              yathish.ai
            </h1>
            <span className="rounded bg-gradient-to-r from-amber-500 to-[#cc785c] px-1.5 py-0.2 text-[10px] font-mono font-bold text-white shadow-2xs">
              0.0001% Frontier
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                hasApiKey
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-stone-400'
              }`}
            />
            <span className="text-[10px] text-stone-500 font-mono">
              Unrestricted Frontier Neural Architecture • Online
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <nav className="flex items-center rounded-lg border border-stone-200/80 bg-white p-0.5 shadow-2xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-[#cc785c] text-white shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Chat & Artifacts</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'studio'
              ? 'bg-[#cc785c] text-white shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
          title="Multimodal Studio: Music (Lyria), Video (Veo 3), Voice (Live 3.8), Image Preview, and Transcribe"
        >
          <Video className="h-3.5 w-3.5 text-amber-500" />
          <span>Multimodal Studio</span>
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-mono font-bold">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'prompt'
              ? 'bg-[#cc785c] text-white shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
          title="Tune our AI - System prompt architecture, guidelines, and presets"
        >
          <FileCode2 className="h-3.5 w-3.5" />
          <span>Tune our AI</span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'memory'
              ? 'bg-[#cc785c] text-white shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Memory Filesystem</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'skills'
              ? 'bg-[#cc785c] text-white shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Wrench className="h-3.5 w-3.5" />
          <span>Skills & Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('evolution')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'evolution'
              ? 'bg-[#cc785c] text-white shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
          title="Self-Evolving Intelligence Engine & Autonomous Learning Hub"
        >
          <Brain className="h-3.5 w-3.5 text-amber-500" />
          <span>Self-Evolution</span>
          <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[9px] font-mono font-bold">
            Gen 3
          </span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Firebase Authentication Sign-In / User Profile */}
        {currentUser ? (
          <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2 py-1 shadow-2xs">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="User"
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#cc785c] text-white text-[10px] font-bold">
                {currentUser.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="text-xs font-medium text-stone-800 max-w-[90px] truncate hidden sm:inline">
              {currentUser.displayName?.split(' ')[0] || 'User'}
            </span>
            <button
              onClick={onSignOut}
              className="p-1 text-stone-400 hover:text-stone-700 transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-2xs cursor-pointer"
            title="Sign in with Google via Firebase Auth to sync data with Firestore"
          >
            <LogIn className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Temperature slider badge */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs shadow-2xs">
          <SlidersHorizontal className="h-3.5 w-3.5 text-stone-400" />
          <span className="text-[11px] text-stone-500 font-mono">Temp: {temperature}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-16 accent-[#cc785c] cursor-pointer h-1"
          />
        </div>

        <PWAInstallButton />

        <button
          onClick={onOpenMobileModal}
          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
          title="Open or install app on mobile phone"
        >
          <Smartphone className="h-3.5 w-3.5 text-[#cc785c]" />
          <span className="hidden sm:inline">QR Code</span>
        </button>

        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Session</span>
        </button>
      </div>
    </header>
  );
}
