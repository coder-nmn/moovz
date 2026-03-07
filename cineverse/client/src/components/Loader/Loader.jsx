import './Loader.css';

export function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-spinner">
        <div className="spinner-ring" />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster shimmer" />
      <div className="skeleton-info">
        <div className="skeleton-title shimmer" />
        <div className="skeleton-year shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 10 }) {
  return (
    <div className="movie-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="inline-loader">
      <div className="dot-pulse">
        <span /><span /><span />
      </div>
    </div>
  );
}
