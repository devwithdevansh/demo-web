import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface Props {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function CameraQrScanner({ onScanSuccess, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const readerId = 'gym-qr-reader';
    const html5QrCode = new Html5Qrcode(readerId);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        setError(null);
        setScanning(true);

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!hasScannedRef.current) {
              hasScannedRef.current = true;
              try {
                navigator.vibrate?.([100, 50, 100]);
              } catch {
                // ignore if vibrate is not supported
              }
              onScanSuccess(decodedText);
            }
          },
          () => {
            // ignore scan frame errors
          }
        );
      } catch (err) {
        console.error('Camera QR start error:', err);
        setError('Could not access camera. Please allow camera permissions in your browser settings.');
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {}).then(() => {
            scannerRef.current?.clear();
          });
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-sm border border-line bg-ink-2 p-5 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 text-mute hover:text-bone transition-colors"
          title="Close scanner"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center gap-2 text-red font-mono text-xs uppercase tracking-wider">
          <Camera size={16} />
          <span>Gym Check-In Scanner</span>
        </div>

        <h3 className="mt-1 font-display text-2xl uppercase tracking-wider text-bone">
          Scan Reception QR
        </h3>
        <p className="mt-1 font-mono text-xs text-mute">
          Point your phone camera at the QR code on the gym counter
        </p>

        {error ? (
          <div className="mt-5 border border-red/40 bg-red-dim/40 p-4 font-mono text-xs text-red">
            <AlertCircle size={24} className="mx-auto mb-2 text-red" />
            <p>{error}</p>
            <p className="mt-2 text-[10px] text-mute">
              Tip: If you're on iPhone Safari or Chrome, tap the address bar icon to allow Camera.
            </p>
          </div>
        ) : (
          <div className="relative mt-5 overflow-hidden rounded border border-line bg-black">
            <div id="gym-qr-reader" className="w-full" />
            {scanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 border-2 border-dashed border-red/80 animate-pulse rounded" />
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full border border-line py-2.5 font-mono text-xs uppercase tracking-wider text-mute hover:text-bone transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
