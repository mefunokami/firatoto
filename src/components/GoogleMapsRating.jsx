import React from 'react';

/**
 * Google Maps puanı ve yıldız gösterimi (ürün yorumları değil).
 */
export default function GoogleMapsRating({
  rating = 0,
  reviewCount = 0,
  mapsUrl = '#',
  size = 'md',
  showGoogleLabel = true,
  className = '',
}) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const count = Math.max(0, parseInt(reviewCount, 10) || 0);

  const starSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const stars = [1, 2, 3, 4, 5].map((i) => {
    const filled = r >= i;
    const half = !filled && r >= i - 0.5;
    return (
      <span
        key={i}
        className={`${starSize} leading-none ${filled ? 'text-yellow-400' : half ? 'text-yellow-300' : 'text-gray-300'}`}
        aria-hidden
      >
        {half ? '★' : filled ? '★' : '☆'}
      </span>
    );
  });

  const content = (
    <>
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className={`font-bold text-gray-800 dark:text-gray-200 ${textSize}`}>{r.toFixed(1)}</span>
      {showGoogleLabel && (
        <span className={`text-gray-500 dark:text-gray-400 ${textSize}`}>
          Google · {count.toLocaleString('tr-TR')} yorum
        </span>
      )}
    </>
  );

  if (!mapsUrl || mapsUrl === '#') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Google Maps yorumlarını görüntüle"
      className={`inline-flex flex-wrap items-center gap-2 rounded-lg px-2 py-1 -mx-2 hover:bg-yellow-50 transition-colors ${className}`}
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {content}
    </a>
  );
}
