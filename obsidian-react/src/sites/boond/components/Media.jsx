import { useState } from 'react';
import { src } from '../content';

export function Img({ m, alt, className = '', style, eager = false }) {
  const [state, setState] = useState('loading');
  return (
    <div className={`overflow-hidden ${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative'} ${state === 'error' ? 'media-empty' : ''} ${className}`} style={style}>
      {state !== 'error' && (
        <img
          src={src(m)}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: state === 'ok' ? 1 : 0 }}
        />
      )}
    </div>
  );
}

// Plays a local video if it exists; otherwise the poster image stays.
export function Video({ file, poster, className = '' }) {
  const [ok, setOk] = useState(false);
  return (
    <div className={`absolute inset-0 ${className}`}>
      {poster && <Img m={poster} alt="" eager className="absolute inset-0" />}
      <video
        src={file}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onCanPlay={() => setOk(true)}
        onError={() => setOk(false)}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        style={{ opacity: ok ? 1 : 0 }}
      />
    </div>
  );
}
