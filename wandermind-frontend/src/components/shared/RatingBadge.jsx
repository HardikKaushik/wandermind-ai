import { Star } from 'lucide-react'

export default function RatingBadge({ rating, reviews, size = 'sm' }) {
  const stars = Math.round(rating || 0)
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size === 'sm' ? 12 : 14}
            className={i <= stars ? 'text-amber-700 fill-amber-500' : 'text-gray-700'}
          />
        ))}
      </div>
      <span className={`${textSize} text-amber-700 font-mono font-semibold`}>
        {rating?.toFixed(1)}
      </span>
      {reviews && (
        <span className={`${textSize} text-gray-700`}>({reviews.toLocaleString()})</span>
      )}
    </div>
  )
}
