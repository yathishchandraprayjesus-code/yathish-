import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare, ArrowUpRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside installed standalone app mode, hide
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 text-xs font-medium">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setShowModal(false), 2000);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 rounded-lg bg-[#cc785c] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#b8674d] active:scale-95 transition-all"
        title="Install yathish.ai as a mobile or desktop app"
      >
        <Download className="h-3.5 w-3.5 animate-bounce" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Get App</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#cc785c] text-white shadow-xs">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-900">Install yathish.ai App</h3>
                <p className="text-xs text-stone-500">Run fullscreen without browser address bars</p>
              </div>
            </div>

            {/* Content based on platform */}
            <div className="mt-5 space-y-4 text-xs text-stone-700">
              {isInstallable ? (
                <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                  <p className="font-medium text-stone-900 mb-2">Ready for 1-Click Install:</p>
                  <button
                    onClick={async () => {
                      const res = await install();
                      if (res) setInstallSuccess(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#cc785c] py-2.5 text-sm font-semibold text-white hover:bg-[#b8674d] transition shadow-xs"
                  >
                    <Download className="h-4 w-4" />
                    Confirm & Install Now
                  </button>
                  {installSuccess && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-emerald-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      App installation initiated! Check your home screen.
                    </div>
                  )}
                </div>
              ) : isIOS ? (
                /* iOS Safari instructions */
                <div className="space-y-3 rounded-xl bg-stone-50 p-4 border border-stone-200">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5 text-sm">
                    <span>How to Install on iPhone / iPad:</span>
                  </div>
                  <ol className="space-y-2.5 pl-1 list-decimal list-inside text-stone-600 leading-relaxed">
                    <li>
                      Open this URL in <strong>Safari</strong> browser.
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span>Tap the <strong>Share</strong> button</span>
                      <Share2 className="h-3.5 w-3.5 inline text-blue-600 mt-0.5" />
                      <span>in the bottom toolbar.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span>Scroll down and select <strong>Add to Home Screen</strong></span>
                      <PlusSquare className="h-3.5 w-3.5 inline text-[#cc785c] mt-0.5" />
                    </li>
                    <li>
                      Tap <strong>Add</strong> at the top right.
                    </li>
                  </ol>
                  <p className="text-[11px] text-stone-500 italic pt-1">
                    The <strong>yathish.ai</strong> icon will be added to your home screen and open directly as a native app!
                  </p>
                </div>
              ) : isAndroid ? (
                /* Android Chrome instructions */
                <div className="space-y-3 rounded-xl bg-stone-50 p-4 border border-stone-200">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5 text-sm">
                    <span>How to Install on Android:</span>
                  </div>
                  <ol className="space-y-2.5 pl-1 list-decimal list-inside text-stone-600 leading-relaxed">
                    <li>
                      Open this page in <strong>Google Chrome</strong>.
                    </li>
                    <li>
                      Tap the <strong>three dots menu (⋮)</strong> at the top right of Chrome.
                    </li>
                    <li>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </li>
                    <li>
                      Tap <strong>Install</strong> to confirm.
                    </li>
                  </ol>
                  <p className="text-[11px] text-stone-500 italic pt-1">
                    An app icon named <strong>yathish.ai</strong> will appear on your phone's home screen.
                  </p>
                </div>
              ) : (
                /* Desktop Chrome/Edge instructions */
                <div className="space-y-3 rounded-xl bg-stone-50 p-4 border border-stone-200">
                  <div className="font-semibold text-stone-900 text-sm">
                    Install on PC / Mac:
                  </div>
                  <ol className="space-y-2 list-decimal list-inside text-stone-600 leading-relaxed">
                    <li>
                      In Chrome or Edge, look at the right end of the address bar for the <strong>Install icon (computer with down arrow)</strong>.
                    </li>
                    <li>
                      Click it and select <strong>Install yathish.ai</strong>.
                    </li>
                    <li>
                      Or click the browser menu (⋮) → <strong>Cast, save, and share</strong> → <strong>Install yathish.ai</strong>.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
              <span className="text-[11px] text-stone-400">
                PWA • Real-time AI • Fullscreen
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-stone-100 px-4 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
