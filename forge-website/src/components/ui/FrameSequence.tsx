import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

export interface FrameSequenceHandle {
  setFrame: (frame: number) => void;
}

interface FrameSequenceProps {
  frameCount: number;
  framePath: (index: number) => string;
}

export const FrameSequence = forwardRef<FrameSequenceHandle, FrameSequenceProps>(
  ({ frameCount, framePath }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(false);
    
    // Keep track of current frame for the imperative handle
    const stateRef = useRef({ frame: 0 });

    useEffect(() => {
      // Preload images
      const imgArray: HTMLImageElement[] = [];
      let isFirstFrameLoaded = false;
      
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = framePath(i);
        img.onload = () => {
          if (i === 1 && !isFirstFrameLoaded) {
            isFirstFrameLoaded = true;
            setLoaded(true);
          }
        };
        img.onerror = () => {
          if (i === 1 && !isFirstFrameLoaded) {
            isFirstFrameLoaded = true;
            setLoaded(true);
          }
        };
        imgArray.push(img);
      }
      
      setImages(imgArray);
    }, [frameCount, framePath]);

    const render = () => {
      if (!canvasRef.current || images.length === 0) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const index = Math.min(Math.round(stateRef.current.frame), frameCount - 1);
      const img = images[index];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    useImperativeHandle(ref, () => ({
      setFrame: (frame: number) => {
        stateRef.current.frame = frame;
        if (loaded) render();
      }
    }));

    useEffect(() => {
      if (!loaded || !canvasRef.current || images.length === 0) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const firstImg = images[0];
      if (firstImg.complete && firstImg.naturalWidth > 0) {
        canvas.width = firstImg.naturalWidth;
        canvas.height = firstImg.naturalHeight;
      }

      // Initial render
      render();
    }, [loaded, images, frameCount]);

    return (
      <div ref={containerRef} className="h-[100svh] w-full">
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover"
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink">
            <div className="text-bone font-mono text-sm uppercase tracking-widest animate-pulse">
              Loading Sequence...
            </div>
          </div>
        )}
      </div>
    );
  }
);
