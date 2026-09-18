import React from 'react'

interface ClayBlobsProps {
  /**
   * `app`     — subtler wash for dense operational screens.
   * `display` — richer wash for landing / marketing surfaces.
   */
  variant?: 'app' | 'display'
}

/**
 * Ambient clay lighting.
 *
 * Four large, slowly drifting colour blobs sit behind the entire UI. They are
 * what makes the glass-clay surfaces (`bg-white/70` + `backdrop-blur`) read as
 * translucent clay rather than flat panels, so this layer must be mounted once
 * per page, above the canvas colour but behind all content (`-z-10`).
 */
export const ClayBlobs: React.FC<ClayBlobsProps> = ({ variant = 'app' }) => {
  const opacity = variant === 'display' ? 'opacity-100' : 'opacity-70'

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-clay-canvas ${opacity}`}
    >
      {/* Violet — primary accent, top-left */}
      <div
        className="clay-blob clay-blob-float -left-[10%] -top-[10%] h-[60vh] w-[60vh] bg-blue-500/10"
        style={{ animationDelay: '0ms' }}
      />
      {/* Hot pink — secondary accent, right */}
      <div
        className="clay-blob clay-blob-float-delayed -right-[10%] top-[20%] h-[55vh] w-[55vh] bg-indigo-500/10"
        style={{ animationDelay: '2000ms' }}
      />
      {/* Sky — tertiary, bottom-left */}
      <div
        className="clay-blob clay-blob-float-slow -left-[5%] bottom-[-10%] h-[50vh] w-[50vh] bg-cyan-500/10"
        style={{ animationDelay: '4000ms' }}
      />
      {/* Mint — subtle balance, bottom-right */}
      <div
        className="clay-blob clay-blob-float bottom-[-15%] right-[5%] h-[45vh] w-[45vh] bg-emerald-500/10"
        style={{ animationDelay: '6000ms' }}
      />
    </div>
  )
}

export default ClayBlobs
