import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Film,
  Image as ImageIcon,
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  Sparkles,
  Upload,
  Radio,
  FileText,
  Check,
  Copy,
  RotateCcw,
  Volume2,
  Layers,
  Wand2,
  Video,
  X,
  Disc,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { saveMediaCreation } from '../firebase/config';

interface MultimodalStudioProps {
  currentUser: User | null;
  onSendToChat?: (text: string, image?: string) => void;
}

export function MultimodalStudio({ currentUser, onSendToChat }: MultimodalStudioProps) {
  const [activeTool, setActiveTool] = useState<'music' | 'video' | 'image' | 'voice' | 'transcribe'>('music');

  // Music State
  const [musicPrompt, setMusicPrompt] = useState('An uplifting cinematic orchestral adventure with soaring strings and brass');
  const [musicModel, setMusicModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [musicImage, setMusicImage] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [musicLyrics, setMusicLyrics] = useState<string | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('A sleek futuristic hovercraft gliding through a neon rainy cyberpunk metropolis');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoImage, setVideoImage] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatusMessage, setVideoStatusMessage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Image State
  const [imagePrompt, setImagePrompt] = useState('A serene Japanese zen garden with cherry blossoms reflected in crystal water at sunrise');
  const [imageInputFile, setImageInputFile] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Transcribe State
  const [isRecordingTranscribe, setIsRecordingTranscribe] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [copiedTranscribe, setCopiedTranscribe] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live Voice State (gemini-3.8-live)
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('Ready to talk');
  const liveWsRef = useRef<WebSocket | null>(null);
  const liveAudioCtxRef = useRef<AudioContext | null>(null);
  const liveMicStreamRef = useRef<MediaStream | null>(null);

  // Clean up Live audio & recorder on unmount
  useEffect(() => {
    return () => {
      if (liveWsRef.current) liveWsRef.current.close();
      if (liveMicStreamRef.current) liveMicStreamRef.current.getTracks().forEach((t) => t.stop());
      if (liveAudioCtxRef.current) liveAudioCtxRef.current.close().catch(() => {});
    };
  }, []);

  // --- 1. GENERATE MUSIC (Lyria) ---
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() && !musicImage) return;
    setIsGeneratingMusic(true);
    setMusicError(null);
    setGeneratedAudioUrl(null);
    setMusicLyrics(null);

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          model: musicModel,
          image: musicImage,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Music generation failed');
      }

      if (data.audioBase64) {
        const audioDataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        setGeneratedAudioUrl(audioDataUrl);
        setMusicLyrics(data.lyrics || null);

        if (currentUser) {
          saveMediaCreation(currentUser.uid, {
            id: `music-${Date.now()}`,
            type: 'music',
            prompt: musicPrompt,
            audioUrl: audioDataUrl,
            model: musicModel,
            createdAt: Date.now(),
          });
        }
      } else {
        throw new Error('No audio was produced.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMusicError(msg);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // --- 2. GENERATE VIDEO & ANIMATE IMAGES (Veo 3) ---
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() && !videoImage) return;
    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);
    setVideoStatusMessage('Initializing Veo 3 Neural Video Engine...');

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          image: videoImage,
          aspectRatio: videoAspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to start video synthesis');
      }

      const operationName = data.operationName;
      if (!operationName) {
        throw new Error('No operation name received');
      }

      // Poll video operation status
      setVideoStatusMessage('Synthesizing frames with temporal physics coherence...');
      let attempts = 0;
      const maxAttempts = 30;

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });
          const statusData = await statusRes.json();

          if (statusData.done) {
            clearInterval(pollInterval);
            setIsGeneratingVideo(false);
            setVideoStatusMessage(null);
            if (statusData.videoUri) {
              setGeneratedVideoUrl(statusData.videoUri);
              if (currentUser) {
                saveMediaCreation(currentUser.uid, {
                  id: `video-${Date.now()}`,
                  type: 'video',
                  prompt: videoPrompt,
                  mediaUrl: statusData.videoUri,
                  aspectRatio: videoAspectRatio,
                  model: 'veo-3.1-fast-generate-preview',
                  createdAt: Date.now(),
                });
              }
            } else {
              setVideoError('Video generation concluded without a valid URL.');
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsGeneratingVideo(false);
            setVideoStatusMessage('Rendering is processing in the cloud. Check back momentarily.');
          } else {
            setVideoStatusMessage(`Rendering cinematic video (${attempts * 4}s elapsed)...`);
          }
        } catch {
          // keep polling
        }
      }, 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setVideoError(msg);
      setIsGeneratingVideo(false);
      setVideoStatusMessage(null);
    }
  };

  // --- 3. CREATE & EDIT IMAGES (gemini-3.1-flash-image-preview) ---
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() && !imageInputFile) return;
    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          image: imageInputFile,
          aspectRatio: imageAspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Image generation failed');
      }

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        if (currentUser) {
          saveMediaCreation(currentUser.uid, {
            id: `img-${Date.now()}`,
            type: 'image',
            prompt: imagePrompt,
            mediaUrl: data.imageUrl,
            aspectRatio: imageAspectRatio,
            model: 'gemini-3.1-flash-image-preview',
            createdAt: Date.now(),
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setImageError(msg);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- 4. AUDIO TRANSCRIPTION (gemini-3.5-transcribe) ---
  const startRecordingTranscribe = async () => {
    audioChunksRef.current = [];
    setTranscriptionResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data.transcription) {
              setTranscriptionResult(data.transcription);
              if (currentUser) {
                saveMediaCreation(currentUser.uid, {
                  id: `transcribe-${Date.now()}`,
                  type: 'transcription',
                  prompt: 'Microphone recording',
                  text: data.transcription,
                  model: 'gemini-3.5-transcribe',
                  createdAt: Date.now(),
                });
              }
            }
          } catch (err) {
            console.error('Transcription error:', err);
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      recorder.start();
      setIsRecordingTranscribe(true);
    } catch (err) {
      console.warn('Microphone access denied:', err);
    }
  };

  const stopRecordingTranscribe = () => {
    if (mediaRecorderRef.current && isRecordingTranscribe) {
      mediaRecorderRef.current.stop();
      setIsRecordingTranscribe(false);
    }
  };

  // --- 5. LIVE VOICE CONVERSATION (gemini-3.8-live) ---
  const toggleLiveVoice = async () => {
    if (isLiveActive) {
      // Disconnect
      if (liveWsRef.current) {
        liveWsRef.current.close();
        liveWsRef.current = null;
      }
      if (liveMicStreamRef.current) {
        liveMicStreamRef.current.getTracks().forEach((t) => t.stop());
        liveMicStreamRef.current = null;
      }
      if (liveAudioCtxRef.current) {
        liveAudioCtxRef.current.close().catch(() => {});
        liveAudioCtxRef.current = null;
      }
      setIsLiveActive(false);
      setLiveStatus('Session ended');
      return;
    }

    // Connect to WebSocket Live endpoint
    try {
      setLiveStatus('Connecting to Gemini 3.8 Live API...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      liveAudioCtxRef.current = outputAudioCtx;

      ws.onopen = async () => {
        setIsLiveActive(true);
        setLiveStatus('Listening... Speak naturally.');

        // Capture Mic Audio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        liveMicStreamRef.current = stream;

        const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
        const source = inputAudioCtx.createMediaStreamSource(stream);
        const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert float32 to 16-bit PCM
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          const bytes = new Uint8Array(pcm16.buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          ws.send(JSON.stringify({ audio: base64 }));
        };

        source.connect(processor);
        processor.connect(inputAudioCtx.destination);
      };

      let nextStartTime = 0;

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            setLiveStatus('Gemini is speaking...');
            const binaryString = atob(msg.audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const pcm16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
              float32[i] = pcm16[i] / 32768.0;
            }

            const audioBuffer = outputAudioCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.copyToChannel(float32, 0);

            const bufferSource = outputAudioCtx.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(outputAudioCtx.destination);

            const currentTime = outputAudioCtx.currentTime;
            if (nextStartTime < currentTime) {
              nextStartTime = currentTime;
            }
            bufferSource.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
          }

          if (msg.interrupted) {
            nextStartTime = outputAudioCtx.currentTime;
            setLiveStatus('Interrupted. Listening...');
          }

          if (msg.error) {
            setLiveStatus(`Live notice: ${msg.error}`);
          }
        } catch {
          // ignore
        }
      };

      ws.onerror = () => {
        setLiveStatus('Live connection error.');
        setIsLiveActive(false);
      };

      ws.onclose = () => {
        setIsLiveActive(false);
        setLiveStatus('Disconnected.');
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLiveStatus(`Failed to initialize: ${msg}`);
      setIsLiveActive(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#faf9f6] text-stone-900 overflow-y-auto">
      {/* Studio Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#cc785c] to-amber-500 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Frontier Multimodal Studio
              </h2>
              <p className="text-xs text-stone-500">
                Generate music, animate videos, edit images, transcribe audio, and talk live with Gemini.
              </p>
            </div>
          </div>

          {/* Tool Navigation */}
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs">
            <button
              onClick={() => setActiveTool('music')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTool === 'music' ? 'bg-[#cc785c] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Music className="h-3.5 w-3.5" />
              <span>Music (Lyria)</span>
            </button>

            <button
              onClick={() => setActiveTool('video')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTool === 'video' ? 'bg-[#cc785c] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span>Video (Veo 3)</span>
            </button>

            <button
              onClick={() => setActiveTool('image')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTool === 'image' ? 'bg-[#cc785c] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Image Preview</span>
            </button>

            <button
              onClick={() => setActiveTool('voice')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTool === 'voice' ? 'bg-[#cc785c] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Live Voice (3.8)</span>
            </button>

            <button
              onClick={() => setActiveTool('transcribe')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTool === 'transcribe' ? 'bg-[#cc785c] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Transcribe (3.5)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Studio Workspace Content */}
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* 1. MUSIC GENERATION (Lyria) */}
        {activeTool === 'music' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Music className="h-5 w-5 text-[#cc785c]" />
                    AI Music Synthesis
                  </h3>
                  <p className="text-xs text-stone-500">
                    Generate audio tracks and lyrics using Google Lyria models.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">Model:</span>
                  <select
                    value={musicModel}
                    onChange={(e) => setMusicModel(e.target.value as any)}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800"
                  >
                    <option value="lyria-3-clip-preview">Lyria Clip (Short 30s)</option>
                    <option value="lyria-3-pro-preview">Lyria Pro (Full Track)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Musical Prompt & Style Direction
                  </label>
                  <textarea
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs md:text-sm text-stone-900 focus:bg-white focus:border-[#cc785c] focus:outline-hidden"
                    placeholder="E.g. Upbeat lo-fi chillhop beats with warm Rhodes piano and vinyl crackle..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100">
                      <Upload className="h-3.5 w-3.5 text-stone-500" />
                      <span>{musicImage ? 'Image Attached' : 'Attach Inspiration Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setMusicImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {musicImage && (
                      <button
                        onClick={() => setMusicImage(null)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleGenerateMusic}
                    disabled={isGeneratingMusic || (!musicPrompt && !musicImage)}
                    className="flex items-center gap-2 rounded-xl bg-[#cc785c] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#b8674d] disabled:opacity-50 transition cursor-pointer"
                  >
                    {isGeneratingMusic ? (
                      <>
                        <Disc className="h-4 w-4 animate-spin" />
                        <span>Composing Track...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        <span>Generate Music</span>
                      </>
                    )}
                  </button>
                </div>

                {musicError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    {musicError}
                  </div>
                )}
              </div>
            </div>

            {/* Generated Audio Player */}
            {generatedAudioUrl && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Volume2 className="h-4 w-4 text-[#cc785c]" />
                    <span>Generated Musical Track</span>
                  </div>
                  <a
                    href={generatedAudioUrl}
                    download="generated-music.wav"
                    className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download WAV</span>
                  </a>
                </div>

                <audio controls src={generatedAudioUrl} className="w-full" autoPlay />

                {musicLyrics && (
                  <div className="mt-3 rounded-xl border border-stone-100 bg-stone-50/70 p-4">
                    <h4 className="text-xs font-bold text-stone-700 mb-1">Generated Lyrics & Structure:</h4>
                    <p className="whitespace-pre-wrap text-xs text-stone-600 font-mono leading-relaxed">
                      {musicLyrics}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. VIDEO GENERATION (Veo 3) */}
        {activeTool === 'video' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Film className="h-5 w-5 text-[#cc785c]" />
                    Veo 3 Video Synthesis & Photo Animation
                  </h3>
                  <p className="text-xs text-stone-500">
                    Generate videos from text or animate photos using veo-3.1-fast-generate-preview.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">Aspect Ratio:</span>
                  <div className="flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
                    <button
                      onClick={() => setVideoAspectRatio('16:9')}
                      className={`px-2.5 py-1 rounded font-semibold transition ${
                        videoAspectRatio === '16:9' ? 'bg-[#cc785c] text-white shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      onClick={() => setVideoAspectRatio('9:16')}
                      className={`px-2.5 py-1 rounded font-semibold transition ${
                        videoAspectRatio === '9:16' ? 'bg-[#cc785c] text-white shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      9:16 Portrait
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Video Prompt / Animation Motion Description
                </label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs md:text-sm text-stone-900 focus:bg-white focus:border-[#cc785c] focus:outline-hidden"
                  placeholder="E.g. Camera slowly glides forward over dramatic volcanic islands, cinematic mist, 4K..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100">
                    <Upload className="h-3.5 w-3.5 text-stone-500" />
                    <span>{videoImage ? 'Photo Attached (Photo-to-Video)' : 'Upload Photo to Animate'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setVideoImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {videoImage && (
                    <button
                      onClick={() => setVideoImage(null)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || (!videoPrompt && !videoImage)}
                  className="flex items-center gap-2 rounded-xl bg-[#cc785c] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#b8674d] disabled:opacity-50 transition cursor-pointer"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Disc className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Video...</span>
                    </>
                  ) : (
                    <>
                      <Film className="h-4 w-4" />
                      <span>Generate Veo 3 Video</span>
                    </>
                  )}
                </button>
              </div>

              {videoStatusMessage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2 animate-pulse">
                  <Disc className="h-4 w-4 animate-spin text-amber-600" />
                  <span>{videoStatusMessage}</span>
                </div>
              )}

              {videoError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {videoError}
                </div>
              )}
            </div>

            {/* Generated Video Player */}
            {generatedVideoUrl && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Video className="h-4 w-4 text-[#cc785c]" />
                    <span>Veo 3 Rendered Output</span>
                  </h4>
                  <a
                    href={generatedVideoUrl}
                    download="veo-video.mp4"
                    className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>

                <div className="overflow-hidden rounded-xl bg-black flex justify-center max-h-[500px]">
                  <video controls autoPlay loop src={generatedVideoUrl} className="max-h-[500px] w-auto" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. IMAGE PREVIEW (gemini-3.1-flash-image-preview) */}
        {activeTool === 'image' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-[#cc785c]" />
                    Create & Edit Images
                  </h3>
                  <p className="text-xs text-stone-500">
                    High-resolution image generation and editing with gemini-3.1-flash-image-preview.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">Aspect Ratio:</span>
                  <select
                    value={imageAspectRatio}
                    onChange={(e) => setImageAspectRatio(e.target.value as any)}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Portrait</option>
                    <option value="4:3">4:3 Classic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Prompt (or Edit Instructions if photo is uploaded)
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs md:text-sm text-stone-900 focus:bg-white focus:border-[#cc785c] focus:outline-hidden"
                  placeholder="E.g. A hyper-realistic architectural villa in Scandinavia with dramatic floor-to-ceiling glass..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100">
                    <Upload className="h-3.5 w-3.5 text-stone-500" />
                    <span>{imageInputFile ? 'Image Loaded (Edit Mode)' : 'Upload Image to Edit'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setImageInputFile(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {imageInputFile && (
                    <button
                      onClick={() => setImageInputFile(null)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Clear Upload
                    </button>
                  )}
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || (!imagePrompt && !imageInputFile)}
                  className="flex items-center gap-2 rounded-xl bg-[#cc785c] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#b8674d] disabled:opacity-50 transition cursor-pointer"
                >
                  {isGeneratingImage ? (
                    <>
                      <Disc className="h-4 w-4 animate-spin" />
                      <span>Generating Image...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>{imageInputFile ? 'Apply Image Edits' : 'Generate Image'}</span>
                    </>
                  )}
                </button>
              </div>

              {imageError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {imageError}
                </div>
              )}
            </div>

            {/* Generated Image Result */}
            {generatedImageUrl && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#cc785c]" />
                    <span>Generated Image Output</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    {onSendToChat && (
                      <button
                        onClick={() => onSendToChat('Analyze this generated image', generatedImageUrl)}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                      >
                        Send to Chat
                      </button>
                    )}
                    <a
                      href={generatedImageUrl}
                      download="gemini-image.png"
                      className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-stone-200/60 max-h-[500px] flex justify-center bg-stone-900">
                  <img src={generatedImageUrl} alt="Generated" className="object-contain max-h-[500px]" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. LIVE VOICE CONVERSATIONS (gemini-3.8-live) */}
        {activeTool === 'voice' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xs space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#cc785c]/10 text-[#cc785c]">
                <Radio className="h-8 w-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Gemini 3.8 Live Voice Conversations
                </h3>
                <p className="mt-1 text-xs text-stone-500 max-w-md mx-auto">
                  Low-latency, interruptible real-time voice streaming with native 24kHz natural speech output.
                </p>
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 max-w-sm mx-auto">
                <span className="text-xs font-mono font-semibold text-stone-700">
                  Status: {liveStatus}
                </span>
              </div>

              <button
                onClick={toggleLiveVoice}
                className={`mx-auto flex items-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                  isLiveActive
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-[#cc785c] text-white hover:bg-[#b8674d]'
                }`}
              >
                {isLiveActive ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    <span>End Voice Session</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>Start Voice Conversation</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-stone-400">
                Uses 16kHz microphone capture and direct 24kHz audio synthesis. Speak directly into your microphone.
              </div>
            </div>
          </div>
        )}

        {/* 5. AUDIO TRANSCRIPTION (gemini-3.5-transcribe) */}
        {activeTool === 'transcribe' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Mic className="h-5 w-5 text-[#cc785c]" />
                  Microphone Audio Transcription
                </h3>
                <p className="text-xs text-stone-500">
                  High-accuracy speech-to-text powered by gemini-3.5-transcribe.
                </p>
              </div>

              <div className="flex items-center justify-center p-8 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                {isRecordingTranscribe ? (
                  <button
                    onClick={stopRecordingTranscribe}
                    className="flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-rose-700 animate-pulse cursor-pointer"
                  >
                    <MicOff className="h-4 w-4" />
                    <span>Stop Recording & Transcribe</span>
                  </button>
                ) : (
                  <button
                    onClick={startRecordingTranscribe}
                    disabled={isTranscribing}
                    className="flex items-center gap-2 rounded-2xl bg-[#cc785c] px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#b8674d] disabled:opacity-50 cursor-pointer"
                  >
                    <Mic className="h-4 w-4" />
                    <span>{isTranscribing ? 'Transcribing with Gemini...' : 'Record from Microphone'}</span>
                  </button>
                )}
              </div>

              {transcriptionResult && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">Transcription Result:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transcriptionResult);
                        setCopiedTranscribe(true);
                        setTimeout(() => setCopiedTranscribe(false), 2000);
                      }}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-600 hover:bg-stone-200"
                    >
                      {copiedTranscribe ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-stone-800 leading-relaxed font-sans">
                    {transcriptionResult}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
