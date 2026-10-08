import React, { useState } from 'react';
import {
  Camera,
  X,
  Sparkles,
  Sliders,
  Download,
  Copy,
  Check,
  Send,
  Info,
  Maximize2,
  RefreshCw,
  Layers,
  Zap,
} from 'lucide-react';

interface PhotoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (promptText: string, imageUrl?: string) => void;
}

const PHOTO_PRESETS = [
  {
    title: 'Cinematic 8K Portrait',
    prompt: 'Hyper-realistic portrait of an elderly watchmaker working under a warm desk lamp in a Swiss workshop. Extreme skin micro-texture, 85mm f/1.4 lens, natural window backlight, bokeh particles, Hasselblad medium format color science.',
    aspectRatio: '3:4',
    style: 'Cinematic 8K',
  },
  {
    title: 'Rainy Cyberpunk Alley',
    prompt: 'Ultra-photorealistic shot of a neon-soaked street in Shinjuku at night during heavy rain. Wet asphalt with ray-traced neon reflections, volumetric steam rising from street grates, 35mm f/1.8 anamorphic lens flare.',
    aspectRatio: '16:9',
    style: 'Cinematic Anamorphic',
  },
  {
    title: 'NatGeo Wildlife Macro',
    prompt: 'National Geographic caliber macro shot of a jewel-toned hummingbird hovering beside an exotic rainforest flower. Dew drops with crystal reflections, high-speed 1/8000s shutter freezing wingtips, 100mm f/2.8 macro lens.',
    aspectRatio: '1:1',
    style: 'National Geographic',
  },
  {
    title: 'Architectural Twilight',
    prompt: 'Minimalist concrete villa on a coastal cliff at dusk. Warm interior lighting glowing through floor-to-ceiling glass, architectural photography, long exposure, ultra-sharp geometry, twilight blue sky.',
    aspectRatio: '16:9',
    style: 'Architectural',
  },
  {
    title: '35mm Vintage Street',
    prompt: 'Candid 1970s street photography in Paris with vintage Leica M3, Kodachrome 64 grain, warm retro saturation, soft lens distortion, golden afternoon sunlight through café awning.',
    aspectRatio: '4:3',
    style: '35mm Vintage Film',
  },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', icon: '◻️' },
  { id: '16:9', label: '16:9 Cinema', icon: '▭' },
  { id: '9:16', label: '9:16 Story', icon: '▯' },
  { id: '4:3', label: '4:3 Classic', icon: '▱' },
  { id: '3:4', label: '3:4 Portrait', icon: '▯' },
];

const STYLES = [
  'Ultra-Realistic 8K',
  'National Geographic',
  'Cinematic Anamorphic',
  '35mm Vintage Film',
  'Studio Fashion',
  'Architectural',
];

export function PhotoStudioModal({ isOpen, onClose, onSendToChat }: PhotoStudioModalProps) {
  const [prompt, setPrompt] = useState(PHOTO_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [style, setStyle] = useState('Ultra-Realistic 8K');
  const [lens, setLens] = useState('85mm f/1.4 Portrait Prime');
  const [lighting, setLighting] = useState('Golden Hour & Volumetric Rim');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelType, setModelType] = useState<'flux' | 'turbo'>('flux');
  const [currentImgSrc, setCurrentImgSrc] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    imageUrl?: string;
    proxyUrl?: string;
    enhancedPrompt?: string;
    requiresPaidKey?: boolean;
    provider?: string;
    message?: string;
    dimensions?: { width: number; height: number };
  } | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PHOTO_PRESETS[0]) => {
    setPrompt(preset.prompt);
    setAspectRatio(preset.aspectRatio);
    setStyle(preset.style);
    setGeneratedResult(null);
    setCurrentImgSrc(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedResult(null);
    setCurrentImgSrc(null);

    try {
      setImageLoading(true);
      setImageError(false);
      const fullPrompt = `${prompt.trim()}. Optics: ${lens}. Lighting: ${lighting}. Visual style: ${style}, 8K UHD, photorealistic capture.`;
      const res = await fetch('/api/generate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio,
          style,
          model: modelType,
        }),
      });

      const data = await res.json();
      setCurrentImgSrc(data.imageUrl || null);
      setGeneratedResult({
        imageUrl: data.imageUrl,
        proxyUrl: data.proxyUrl,
        enhancedPrompt: data.optimizedPrompt || fullPrompt,
        requiresPaidKey: data.requiresPaidKey,
        provider: data.provider || 'FLUX.1 Ultra-Realistic Photo Engine',
        message: data.message,
        dimensions: data.dimensions,
      });
    } catch (err: any) {
      console.error('Photo generation request error:', err);
      setGeneratedResult({
        enhancedPrompt: prompt,
        message: 'Network issue contacting photo endpoint. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    const textToCopy = generatedResult?.enhancedPrompt || prompt;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSendPromptToChat = () => {
    const textToSend = `Generate hyper-realistic photography specification and interactive visualizer for:\n\n"${prompt.trim()}"\n\nParameters:\n- Aspect Ratio: ${aspectRatio}\n- Camera Lens: ${lens}\n- Lighting: ${lighting}\n- Style: ${style} 8K UHD`;
    onSendToChat(textToSend, generatedResult?.imageUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-[#cc785c] text-white shadow-xs">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Realistic AI Photo Studio
                </h3>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  8K Frontier Photorealism
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Ultra-realistic camera optics, volumetric lighting physics, and photographic prompt synthesis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#cc785c]" />
                Photorealistic Style Presets
              </span>
              <span className="text-[11px] text-stone-400">Click to load preset</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PHOTO_PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition shadow-2xs ${
                    prompt === p.prompt
                      ? 'border-[#cc785c] bg-[#cc785c]/10 text-[#cc785c] font-semibold'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Subject & Scene Description
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe subject, mood, environment, materials, and textures with cinematic clarity..."
              className="w-full rounded-xl border border-stone-300 p-3 text-xs md:text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#cc785c] focus:ring-1 focus:ring-[#cc785c] focus:outline-hidden"
            />
          </div>

          {/* Camera Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={`rounded-md border px-2 py-1.5 text-xs font-medium text-left transition flex items-center gap-1.5 ${
                      aspectRatio === ar.id
                        ? 'border-[#cc785c] bg-white text-[#cc785c] shadow-2xs font-semibold'
                        : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-white'
                    }`}
                  >
                    <span>{ar.icon}</span>
                    <span>{ar.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lens & Focal Length */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                Camera Lens & Aperture
              </label>
              <select
                value={lens}
                onChange={(e) => setLens(e.target.value)}
                className="w-full rounded-md border border-stone-200 bg-white p-2 text-xs text-stone-800 focus:border-[#cc785c] focus:outline-hidden shadow-2xs"
              >
                <option value="85mm f/1.4 Portrait Prime">85mm f/1.4 (Ultra-shallow DOF & bokeh)</option>
                <option value="50mm f/1.2 Standard Prime">50mm f/1.2 (Natural human eye perspective)</option>
                <option value="24mm f/1.4 Wide Angle">24mm f/1.4 (Expansive landscape/architectural)</option>
                <option value="100mm f/2.8 Macro Lens">100mm f/2.8 (Extreme micro detail)</option>
                <option value="35mm f/1.8 Street Documentary">35mm f/1.8 (Candid documentary)</option>
              </select>

              <label className="block text-[11px] font-semibold text-stone-600 mt-2.5 mb-1.5">
                Lighting Atmosphere
              </label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full rounded-md border border-stone-200 bg-white p-2 text-xs text-stone-800 focus:border-[#cc785c] focus:outline-hidden shadow-2xs"
              >
                <option value="Golden Hour & Volumetric Rim">Golden Hour & Volumetric Rim Light</option>
                <option value="Rembrandt Studio Softbox">Rembrandt Studio Lighting & Softbox</option>
                <option value="Moody Neon & Ray-traced Reflections">Moody Neon & Wet Ground Reflections</option>
                <option value="Diffuse Overcast Soft Natural">Diffuse Overcast Daylight (Low contrast)</option>
                <option value="Dramatic Chiaroscuro High Contrast">Dramatic Chiaroscuro (Caravaggio shadows)</option>
              </select>
            </div>

            {/* Visual Style & Engine Mode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-stone-600">
                  Photography Style
                </label>
                <div className="flex items-center gap-1 bg-stone-200/60 p-0.5 rounded-md text-[10px]">
                  <button
                    type="button"
                    onClick={() => setModelType('flux')}
                    className={`px-1.5 py-0.5 rounded font-medium transition ${
                      modelType === 'flux' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500'
                    }`}
                  >
                    FLUX 8K
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelType('turbo')}
                    className={`px-1.5 py-0.5 rounded font-medium transition ${
                      modelType === 'turbo' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500'
                    }`}
                  >
                    Turbo
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`w-full rounded-md border px-2.5 py-1.5 text-xs text-left font-medium transition ${
                      style === s
                        ? 'border-[#cc785c] bg-white text-[#cc785c] shadow-2xs font-semibold'
                        : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Showcase Area */}
          {generatedResult && (
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Photographic Synthesis Prepared
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-700 font-semibold">
                    {generatedResult.provider || 'FLUX.1 Photorealism'}
                  </span>
                  <span className="text-[10px] font-mono rounded bg-stone-100 px-2 py-0.5 text-stone-600">
                    {aspectRatio} • {style}
                  </span>
                </div>
              </div>

              {generatedResult.imageUrl && !imageError ? (
                <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950 flex flex-col items-center justify-center min-h-[300px] max-h-[460px] group shadow-inner">
                  {imageLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-xs z-10 text-white gap-2">
                      <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
                      <span className="text-xs font-mono text-stone-300">Rendering 8K Photographic Optics...</span>
                    </div>
                  )}
                  <img
                    src={currentImgSrc || generatedResult.imageUrl}
                    alt="Generated realistic photo"
                    referrerPolicy="no-referrer"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      if (generatedResult.proxyUrl && currentImgSrc !== generatedResult.proxyUrl) {
                        setCurrentImgSrc(generatedResult.proxyUrl);
                      } else {
                        setImageLoading(false);
                        setImageError(true);
                      }
                    }}
                    className={`object-contain max-h-[420px] w-full transition-opacity duration-300 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <a
                      href={currentImgSrc || generatedResult.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-stone-900/90 hover:bg-black text-white px-3 py-1.5 text-xs font-semibold backdrop-blur-xs border border-stone-700 transition shadow"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      Full Size
                    </a>
                    <a
                      href={currentImgSrc || generatedResult.imageUrl}
                      download="yathish-ai-photorealistic.jpg"
                      className="flex items-center gap-1.5 rounded-lg bg-[#cc785c] hover:bg-[#b8654a] text-white px-3 py-1.5 text-xs font-semibold backdrop-blur-xs transition shadow"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download 8K
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-stone-800 bg-stone-900 p-5 text-white space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <Camera className="h-4 w-4" />
                      <span>OPTICAL VIEWLOOK SLATE — 8K RAW</span>
                    </div>
                    <span className="text-[10px] text-stone-400">100% Free Engine • Zero Paid Key Needed</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-300">
                    <div className="bg-stone-950 p-2 rounded border border-stone-800">
                      <span className="text-stone-500 block text-[9px]">LENS</span>
                      <span className="font-semibold text-stone-100">{lens}</span>
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800">
                      <span className="text-stone-500 block text-[9px]">LIGHTING</span>
                      <span className="font-semibold text-stone-100">{lighting}</span>
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800">
                      <span className="text-stone-500 block text-[9px]">ASPECT RATIO</span>
                      <span className="font-semibold text-stone-100">{aspectRatio}</span>
                    </div>
                    <div className="bg-stone-950 p-2 rounded border border-stone-800">
                      <span className="text-stone-500 block text-[9px]">STYLE COLOR</span>
                      <span className="font-semibold text-amber-300">{style}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Prompt Display */}
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-stone-600">
                    Enhanced 8K Photographic Prompt
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#cc785c]"
                  >
                    {copiedPrompt ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs font-mono text-stone-800 leading-relaxed break-words">
                  {generatedResult.enhancedPrompt || prompt}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSendPromptToChat}
                  className="flex items-center gap-1.5 rounded-lg bg-[#cc785c] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#b8654a] transition shadow-2xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send to Chat & Synthesize Artifact</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3.5 gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Optics: {lens} • Aspect: {aspectRatio}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-[#cc785c] px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing Photo Optics...</span>
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5" />
                  <span>Generate Photo Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
