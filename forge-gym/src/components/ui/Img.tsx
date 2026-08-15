import { useState } from 'react';
import type { CSSProperties } from 'react';

interface ImgProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  style?: CSSProperties;
}

/**
 * Drop-in <img> replacement. If a placeholder stock URL ever fails to
 * resolve, this degrades to a quiet graphite gradient card instead of a
 * broken-image icon — so swapping in real photography later never risks
 * a visibly broken build in the meantime.
 */
export function Img({ src, alt, className = '', loading = 'lazy', style }: ImgProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-graphite via-ink-2 to-ink flex items-center justify-center ${className}`}
        style={style}
        role="img"
        aria-label={alt}
      >
        <span className="eyebrow text-mute/60 text-center px-4">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
