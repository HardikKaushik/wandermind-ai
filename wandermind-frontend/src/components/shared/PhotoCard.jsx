import { useState } from 'react'
import { MapPin } from 'lucide-react'

export default function PhotoCard({ src, alt, className = '', overlay, mapsQuery }) {
  const [error, setError] = useState(false)
  const [retried, setRetried] = useState(false)

  const fallback = `https://placehold.co/600x400/0F2040/FF6B35?text=${encodeURIComponent((alt || 'Travel').substring(0, 25))}`

  // Skip known-dead unsplash source URLs
  const isDeadUrl = (url) => url && url.includes('source.unsplash.com')
  const effectiveSrc = (src && !isDeadUrl(src)) ? src : fallback
  const displaySrc = error ? fallback : effectiveSrc

  return (
    <div className={`relative overflow-hidden rounded-xl group ${className}`}>
      <img
        src={displaySrc}
        alt={alt || 'Travel photo'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={() => { if (!retried) { setRetried(true); setError(true); } }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {overlay && (
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-sm font-medium truncate">{overlay}</p>
        </div>
      )}
      {mapsQuery && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm
                     opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
          title="Open in Maps"
        >
          <MapPin size={14} className="text-white" />
        </a>
      )}
    </div>
  )
}
