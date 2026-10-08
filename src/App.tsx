import React, { useState, useEffect, useRef } from 'react';
import { Message, ArtifactData, MemoryFile, ChatSession } from './types';
import { DEFAULT_CLAUDE_PROMPT, PERPLEXITY_SYSTEM_PROMPT, PRESET_SCENARIOS, PresetScenario } from './data/claudePrompt';
import { INITIAL_MEMORY_FILES } from './data/mockMemory';
import { extractArtifact } from './utils/artifactDetector';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { ArtifactViewer } from './components/ArtifactViewer';
import { PromptInspector } from './components/PromptInspector';
import { MemoryFilesystemViewer } from './components/MemoryFilesystemViewer';
import { SkillsViewer } from './components/SkillsViewer';
import { EvolutionHub } from './components/EvolutionHub';
import { MultimodalStudio } from './components/MultimodalStudio';
import { MobileActivationModal } from './components/MobileActivationModal';
import { evolutionEngine } from './utils/evolutionEngine';
import {
  auth,
  signInWithGoogle,
  logOut,
  onAuthStateChanged,
  User,
  syncSessionToFirestore,
  loadSessionsFromFirestore,
  deleteSessionFromFirestore,
  syncMemoryFilesToFirestore,
  loadMemoryFilesFromFirestore,
} from './firebase/config';

import {
  saveLocalCache,
  loadLocalCache,
  SESSIONS_STORAGE_KEY,
  MEMORY_STORAGE_KEY,
  PROMPT_STORAGE_KEY,
} from './utils/storage';
import { streamOnlineChat } from './utils/streamClient';

// Counter for collision-free deterministic ID generation
let uniqueIdCounter = 0;
function generateUniqueId(prefix = 'msg'): string {
  uniqueIdCounter += 1;
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now()}-${uniqueIdCounter}-${rand}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'prompt' | 'memory' | 'skills' | 'evolution' | 'studio'>('chat');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    const cached = loadLocalCache(PROMPT_STORAGE_KEY, DEFAULT_CLAUDE_PROMPT);
    if (!cached.includes('# prompt_a_video_booster') || !cached.includes('# autonomous_execution_engine')) {
      return DEFAULT_CLAUDE_PROMPT;
    }
    return cached;
  });
  const [isPromptCustomized, setIsPromptCustomized] = useState(false);
  const [memoryFiles, setMemoryFiles] = useState<MemoryFile[]>(() => {
    const cached = loadLocalCache(MEMORY_STORAGE_KEY, INITIAL_MEMORY_FILES);
    if (!cached.some((f) => f.path === '/topics/prompt_a_video.md')) {
      const pav = INITIAL_MEMORY_FILES.find((f) => f.path === '/topics/prompt_a_video.md');
      if (pav) return [...cached, pav];
    }
    return cached;
  });
  const [activeArtifact, setActiveArtifact] = useState<ArtifactData | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Chat sessions state with local cache persistence and collision prevention
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const rawSessions = loadLocalCache<ChatSession[]>(SESSIONS_STORAGE_KEY, [
      {
        id: 'session-default',
        title: 'Prompt Simulation Chat',
        messages: [],
        createdAt: Date.now(),
      },
    ]);
    const seenIds = new Set<string>();
    return rawSessions.map((session, sIdx) => ({
      ...session,
      id: session.id || `session-${sIdx}-${Date.now()}`,
      messages: (session.messages || []).map((m, mIdx) => {
        let msgId = m.id;
        if (!msgId || seenIds.has(msgId)) {
          msgId = `msg-${Date.now()}-${sIdx}-${mIdx}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seenIds.add(msgId);
        return { ...m, id: msgId };
      }),
    }));
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const cached = loadLocalCache<ChatSession[]>(SESSIONS_STORAGE_KEY, []);
    return cached.length > 0 ? cached[0].id : 'session-default';
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const activeSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // Listen to Firebase Authentication state and sync cloud data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const cloudSessions = await loadSessionsFromFirestore(user.uid);
          if (cloudSessions.length > 0) {
            setSessions(cloudSessions);
            setCurrentSessionId(cloudSessions[0].id);
          }
          const cloudMemory = await loadMemoryFilesFromFirestore(user.uid);
          if (cloudMemory.length > 0) {
            setMemoryFiles(cloudMemory);
          }
        } catch (e) {
          console.warn('Failed to load user cloud data:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Monitor online API connectivity and model health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.hasApiKey === 'boolean') {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch(() => {});
  }, []);

  // Sync sessions to local storage and Firestore
  useEffect(() => {
    saveLocalCache(SESSIONS_STORAGE_KEY, sessions);
    if (currentUser) {
      const current = sessions.find((s) => s.id === currentSessionId);
      if (current) {
        syncSessionToFirestore(currentUser.uid, current);
      }
    }
  }, [sessions, currentUser, currentSessionId]);

  // Sync memory files to local storage and Firestore
  useEffect(() => {
    saveLocalCache(MEMORY_STORAGE_KEY, memoryFiles);
    if (currentUser) {
      syncMemoryFilesToFirestore(currentUser.uid, memoryFiles);
    }
  }, [memoryFiles, currentUser]);

  // Sync system prompt to local storage
  useEffect(() => {
    saveLocalCache(PROMPT_STORAGE_KEY, systemPrompt);
  }, [systemPrompt]);

  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setActiveArtifact(null);
  };

  const handleDeleteSession = (id: string) => {
    if (currentUser) {
      deleteSessionFromFirestore(currentUser.uid, id);
    }
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        return [
          {
            id: 'session-default',
            title: 'New Conversation',
            messages: [],
            createdAt: Date.now(),
          },
        ];
      }
      return filtered;
    });
    if (currentSessionId === id) {
      setCurrentSessionId(sessions[0]?.id || 'session-default');
    }
  };

  const handleClearSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, messages: [], title: 'New Conversation' } : s))
    );
    setActiveArtifact(null);
  };

  const handleUpdatePrompt = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
    setIsPromptCustomized(true);
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_CLAUDE_PROMPT);
    setIsPromptCustomized(false);
  };

  const handleUpdateMemoryFile = (updated: MemoryFile) => {
    setMemoryFiles((prev) => prev.map((f) => (f.path === updated.path ? updated : f)));
  };

  const handleCreateMemoryFile = (newFile: MemoryFile) => {
    setMemoryFiles((prev) => [...prev, newFile]);
  };

  const handleDeleteMemoryFile = (path: string) => {
    setMemoryFiles((prev) => prev.filter((f) => f.path !== path));
  };

  const handleSelectScenario = (scenario: PresetScenario) => {
    if (scenario.category === 'Perplexity Search & Research') {
      setSystemPrompt(PERPLEXITY_SYSTEM_PROMPT);
      setIsPromptCustomized(true);
      handleSendMessage(scenario.prompt, undefined, true, false);
    } else {
      handleSendMessage(scenario.prompt);
    }
  };

  const handleFeedbackMessage = (msgId: string, isPositive: boolean) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === msgId ? { ...m, feedback: isPositive ? 'positive' : 'negative' } : m
        ),
      }))
    );
    const targetMsg = activeSession.messages.find((m) => m.id === msgId);
    evolutionEngine.recordFeedback(isPositive, targetMsg?.content);
  };

  // Compile active system instruction including memory state
  const buildSystemInstruction = () => {
    const listing = memoryFiles
      .map((f) => `- ${f.path}: ${f.description} (ver: ${f.version})`)
      .join('\n');

    const profileDoc = memoryFiles.find((f) => f.path === '/profile.md');
    const profileText = profileDoc ? profileDoc.content.join('\n') : '(not yet written)';

    const preferencesDoc = memoryFiles.find((f) => f.path === '/preferences.md');
    const preferencesText = preferencesDoc ? preferencesDoc.content.join('\n') : '(none)';

    const evolutionDirectives = evolutionEngine.compileEvolutionPromptDirectives();

    return `${systemPrompt}

<profile>
${profileText}
</profile>

<preferences>
${preferencesText}
</preferences>

<memory_listing>
Files currently in memory:
${listing}
</memory_listing>
${evolutionDirectives}
`;
  };

  // Send message to online neural model with live search grounding
  const handleSendMessage = async (
    userText: string,
    image?: string,
    useSearch: boolean = false,
    thinkingMode: boolean = false,
    isRetry: boolean = false,
    selectedModel: string = 'gemini-3.1-flash-lite',
    useMaps: boolean = false,
    customInstruction?: string
  ) => {
    if ((!userText.trim() && !image) || isLoading) return;

    const assistantPlaceholderId = generateUniqueId('asst');

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          if (isRetry) {
            const cleaned = s.messages.filter((m, idx) => {
              if (idx === s.messages.length - 1 && m.role === 'assistant') {
                return false;
              }
              return true;
            });
            const assistantMessage: Message = {
              id: assistantPlaceholderId,
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
            };
            return {
              ...s,
              messages: [...cleaned, assistantMessage],
            };
          }

          const userMessage: Message = {
            id: generateUniqueId('user'),
            role: 'user',
            content: userText,
            image,
            timestamp: Date.now(),
          };

          const assistantMessage: Message = {
            id: assistantPlaceholderId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
          };

          const updatedTitle =
            s.messages.length === 0
              ? userText.slice(0, 30) + (userText.length > 30 ? '...' : '')
              : s.title;

          return {
            ...s,
            title: updatedTitle,
            messages: [...s.messages, userMessage, assistantMessage],
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    const startTime = Date.now();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const baseInstruction = buildSystemInstruction();
    const fullInstruction = customInstruction
      ? `${customInstruction}\n\n${baseInstruction}`
      : baseInstruction;

    try {
      const previousValidMessages = activeSession.messages.filter(
        (m) =>
          ((m.content &&
            m.content.trim().length > 0 &&
            !m.content.startsWith('[Error:') &&
            !m.content.startsWith('\n[Error:') &&
            !m.content.includes('receiving high traffic') &&
            !m.content.includes('tap Retry below')) ||
            Boolean(m.image))
      );

      const messagesPayload = isRetry
        ? previousValidMessages.map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          }))
        : [...previousValidMessages, { role: 'user', content: userText, image }].map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          }));

      let accumulatedText = '';
      let detectedGroundingSources: { title: string; url: string }[] = [];
      let detectedSearchQueries: string[] = [];

      const streamResult = await streamOnlineChat({
        url: '/api/chat',
        payload: {
          messages: messagesPayload,
          systemInstruction: fullInstruction,
          temperature,
          useSearch,
          useMaps,
          thinkingMode,
          model: selectedModel,
        },
        userAbortSignal: controller.signal,
        onChunk: (chunkText) => {
          accumulatedText += chunkText;
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === activeSession.id) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: accumulatedText }
                      : m
                  ),
                };
              }
              return s;
            })
          );
        },
        onGrounding: (grounding) => {
          if (grounding.sources) {
            detectedGroundingSources = grounding.sources;
          }
          if (grounding.searchQueries) {
            detectedSearchQueries = grounding.searchQueries;
          }
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === activeSession.id) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? {
                          ...m,
                          groundingSources: detectedGroundingSources,
                          searchQueries: detectedSearchQueries,
                        }
                      : m
                  ),
                };
              }
              return s;
            })
          );
        },
      });

      let finalContent = streamResult.text || accumulatedText;

      if (!finalContent.trim()) {
        if (streamResult.error) {
          finalContent = `\n[Error: ${streamResult.error}]`;
        } else {
          finalContent = '\n[Error: The online model response was interrupted. Please click Retry below to regenerate.]';
        }
      }

      const { artifact, widget } = extractArtifact(finalContent);

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: finalContent,
                      artifact,
                      widget,
                      groundingSources:
                        detectedGroundingSources.length > 0
                          ? detectedGroundingSources
                          : m.groundingSources,
                      searchQueries:
                        detectedSearchQueries.length > 0
                          ? detectedSearchQueries
                          : m.searchQueries,
                    }
                  : m
              ),
            };
          }
          return s;
        })
      );

      if (artifact) {
        setActiveArtifact(artifact);
      }

      // Self-Evolution Engine: record interaction telemetry and distill memory
      const latencyMs = Date.now() - startTime;
      if (finalContent.trim() && !finalContent.startsWith('\n[Error:')) {
        evolutionEngine.recordInteraction(userText, finalContent, latencyMs);
        const distilledMemory = evolutionEngine.distillMemory(userText, memoryFiles);
        setMemoryFiles(distilledMemory);
      }
    } catch (err: unknown) {
      console.warn('Online chat stream notice:', err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#faf9f6] text-stone-900 font-sans selection:bg-[#cc785c]/20">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewChat={handleNewChat}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        temperature={temperature}
        setTemperature={setTemperature}
        hasApiKey={hasApiKey}
        currentUser={currentUser}
        onSignIn={signInWithGoogle}
        onSignOut={logOut}
      />

      <MobileActivationModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      {/* Main View Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {activeTab === 'chat' && (
          <div className="flex h-full w-full overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ChatView
                session={activeSession}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onStopGeneration={handleStopGeneration}
                onSelectArtifact={(art) => setActiveArtifact(art)}
                activeArtifact={activeArtifact}
                onSelectScenario={handleSelectScenario}
                sessions={sessions}
                onSelectSession={(id) => setCurrentSessionId(id)}
                onDeleteSession={handleDeleteSession}
                onFeedbackMessage={handleFeedbackMessage}
              />
            </div>

            {/* Split Artifacts Panel */}
            {activeArtifact && (
              <ArtifactViewer
                artifact={activeArtifact}
                onClose={() => setActiveArtifact(null)}
              />
            )}
          </div>
        )}

        {activeTab === 'studio' && (
          <MultimodalStudio
            currentUser={currentUser}
            onSendToChat={(text, image) => {
              setActiveTab('chat');
              handleSendMessage(text, image);
            }}
          />
        )}

        {activeTab === 'prompt' && (
          <PromptInspector
            currentPrompt={systemPrompt}
            onUpdatePrompt={handleUpdatePrompt}
            onResetPrompt={handleResetPrompt}
            isCustomized={isPromptCustomized}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryFilesystemViewer
            files={memoryFiles}
            onUpdateFile={handleUpdateMemoryFile}
            onCreateFile={handleCreateMemoryFile}
            onDeleteFile={handleDeleteMemoryFile}
          />
        )}

        {activeTab === 'skills' && <SkillsViewer />}

        {activeTab === 'evolution' && (
          <EvolutionHub onUpdateSystemPrompt={() => setSystemPrompt(DEFAULT_CLAUDE_PROMPT)} />
        )}
      </main>
    </div>
  );
}
