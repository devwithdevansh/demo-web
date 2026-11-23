import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export function QrPass({ code, size = 180 }: { code: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && code) {
      QRCode.toCanvas(
        canvasRef.current,
        code,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#f1efe8',
            light: '#0a0a0a',
          },
        },
        (error) => {
          if (error) console.error('QR Pass render error:', error);
        }
      );
    }
  }, [code, size]);

  return <canvas ref={canvasRef} className="rounded border border-line" />;
}
