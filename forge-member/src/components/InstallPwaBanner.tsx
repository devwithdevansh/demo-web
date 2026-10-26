import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If already installed as standalone PWA, don't show
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);

    if (isStandalone) return;

    // If dismissed recently
    const isDismissed = localStorage.getItem('forge.pwa.dismissed');
    if (isDismissed) return;

    // Check if iOS
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (isIos) {
      setShowIosGuide(true);
      setVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('forge.pwa.dismissed', 'true');
  };

  if (!visible) return null;

  return (
    <aside aria-label="Install App" className="sticky top-0 z-50 border-b border-red/40 bg-ink-2/95 px-4 py-2.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center border border-red/50 bg-red/10 text-red">
            <Smartphone size={16} />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-bone">
              Install Member App
            </p>
            <p className="font-mono text-[10px] text-bone-dim">
              {showIosGuide
                ? 'Tap Share ⎋ & "Add to Home Screen"'
                : 'Add to home screen for 1-tap pass access'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showIosGuide && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-red px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-md hover:bg-red/90 transition-colors"
            >
              <Download size={13} />
              Install
            </button>
          )}

          <button
            onClick={handleDismiss}
            title="Dismiss"
            className="p-1 text-mute hover:text-bone transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
