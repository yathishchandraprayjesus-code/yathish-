import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  X,
  Share2,
  PlusSquare,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface MobileActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileActivationModal({ isOpen, onClose }: MobileActivationModalProps) {
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'iphone' | 'android' | 'playstore'>('playstore');

  if (!isOpen) return null;

  const devUrl = 'https://ais-dev-w7xpdugpztmbts2n4uxrk7-585812489872.asia-southeast1.run.app';
  const preUrl = 'https://ais-pre-w7xpdugpztmbts2n4uxrk7-585812489872.asia-southeast1.run.app';

  const [selectedUrlType, setSelectedUrlType] = useState<'pre' | 'dev'>('pre');
  const activeUrl = selectedUrlType === 'pre' ? preUrl : devUrl;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
    activeUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cc785c]/10 text-[#cc785c]">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Activate on Your Phone
            </h3>
            <p className="text-xs text-stone-500">
              Open instantly on iOS or Android and install as a standalone home screen app.
            </p>
          </div>
        </div>

        {/* URL Selector Tabs */}
        <div className="mt-4 flex rounded-lg bg-stone-100 p-1 text-xs font-medium">
          <button
            onClick={() => setSelectedUrlType('dev')}
            className={`flex-1 rounded-md py-1.5 transition-all text-center ${
              selectedUrlType === 'dev'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Direct Dev URL (Works Now)
          </button>
          <button
            onClick={() => setSelectedUrlType('pre')}
            className={`flex-1 rounded-md py-1.5 transition-all text-center ${
              selectedUrlType === 'pre'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Public Shared URL
          </button>
        </div>

        {selectedUrlType === 'pre' && (
          <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
            <strong>Why it shows "No page formed" on the Shared URL:</strong>
            <p className="mt-0.5 text-[11px] text-amber-700">
              The public shared URL requires clicking the <strong>"Share"</strong> button in the top right corner of the AI Studio editor header. Once shared, Google deploys the public link. In the meantime, use the <strong>Direct Dev URL</strong> below!
            </p>
          </div>
        )}

        {/* QR Code and Quick Link */}
        <div className="mt-3 rounded-xl border border-stone-200 bg-[#fbfbfa] p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="rounded-lg border border-stone-200 bg-white p-2 shadow-2xs shrink-0">
              <img
                src={qrCodeUrl}
                alt="Scan to open on phone"
                className="h-28 w-28 rounded object-contain"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-stone-900">
                <QrCode className="h-4 w-4 text-[#cc785c]" />
                <span>Scan or Copy Link</span>
              </div>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                {selectedUrlType === 'dev'
                  ? 'Sign in with your Google Account (yathish000002@gmail.com) on your phone to open your live development instance.'
                  : 'Public link accessible by anyone after you click "Share" in the AI Studio header.'}
              </p>

              <div className="mt-3 flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={activeUrl}
                  className="flex-1 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-mono text-stone-600 truncate"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-md bg-stone-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-stone-800 transition-colors shrink-0"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Install Guide Tabs */}
        <div className="mt-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="text-xs font-semibold text-stone-900">
              Option 2: Add to Home Screen (Install App)
            </span>
            <div className="flex rounded-lg bg-stone-100 p-0.5 text-xs font-medium">
              <button
                onClick={() => setActivePlatform('playstore')}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  activePlatform === 'playstore'
                    ? 'bg-[#cc785c] text-white shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Play Store (.AAB)
              </button>
              <button
                onClick={() => setActivePlatform('android')}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  activePlatform === 'android'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Android Direct
              </button>
              <button
                onClick={() => setActivePlatform('iphone')}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  activePlatform === 'iphone'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                iPhone (iOS)
              </button>
            </div>
          </div>

          {activePlatform === 'playstore' ? (
            <div className="mt-3 space-y-3 text-xs text-stone-700">
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                <span className="font-semibold text-amber-900">How to get yathish.ai on Google Play:</span>
                <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
                  Because yathish.ai is configured with standard PWA manifests and icons, you can convert it into an official <strong>Google Play Android App Bundle (.aab)</strong> in 3 steps:
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 rounded-lg border border-stone-200 bg-white p-2.5 shadow-2xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#cc785c] text-[11px] font-bold text-white">
                    1
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-stone-900">Generate Android Package via PWABuilder:</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">PWABuilder.com</a> (Google & Microsoft official tool), paste your public URL:
                    </p>
                    <code className="mt-1 block rounded bg-stone-100 p-1 text-[10px] font-mono select-all text-stone-800 truncate">
                      {preUrl}
                    </code>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Click <strong>"Package for Stores"</strong> &rarr; <strong>"Google Play"</strong> to download your signed <strong>.aab</strong> bundle.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-stone-200 bg-white p-2.5 shadow-2xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-stone-900">Open Google Play Console:</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Sign in to <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">play.google.com/console</a> (requires Google Play Developer registration).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-stone-200 bg-white p-2.5 shadow-2xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-stone-900">Upload & Publish:</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Create an app named <strong>yathish.ai</strong>, upload the downloaded <strong>.aab</strong> file, and submit for Google review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : activePlatform === 'iphone' ? (
            <div className="mt-3 space-y-2 text-xs text-stone-700">
              <div className="flex items-start gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  1
                </span>
                <div>
                  <span className="font-semibold text-stone-900">Open in Safari:</span> Scan the QR code or paste the link into Apple Safari on your iPhone.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  2
                </span>
                <div>
                  <span className="font-semibold text-stone-900">Tap Share:</span> In the bottom toolbar of Safari, tap the <Share2 className="inline h-3.5 w-3.5 mx-0.5 text-[#cc785c]" /> <strong>Share</strong> button (square with an arrow pointing up).
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  3
                </span>
                <div>
                  <span className="font-semibold text-stone-900">Add to Home Screen:</span> Scroll down and tap <PlusSquare className="inline h-3.5 w-3.5 mx-0.5 text-[#cc785c]" /> <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top right.
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-xs text-stone-700">
              <div className="flex items-start gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  1
                </span>
                <div>
                  <span className="font-semibold text-stone-900">Open in Chrome / Browser:</span> Scan the QR code or open the link on your Android device.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  2
                </span>
                <div>
                  <span className="font-semibold text-stone-900">Tap Menu (⋮):</span> Tap the three dots menu icon in the top right corner of Chrome.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  3
                </span>
                <div>
                  <span className="font-semibold text-stone-900">Install app:</span> Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. An app icon will be installed directly to your phone launcher.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <Sparkles className="h-3.5 w-3.5 text-[#cc785c]" />
            <span>Runs in full-screen standalone mode</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-100 px-4 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
