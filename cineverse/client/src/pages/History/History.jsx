import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory, clearAllHistory } from '../../features/historySlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonGrid } from '../../components/Loader/Loader';
import { FiClock, FiTrash2 } from 'react-icons/fi';

export default function History() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.history);

  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

  const handleClear = () => {
    if (window.confirm('Clear all watch history?')) {
      dispatch(clearAllHistory());
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <h1 className="section-title"><FiClock style={{ color: 'var(--accent-blue)' }} /> Watch <span className="accent">History</span></h1>
          {items.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleClear}>
              <FiTrash2 /> Clear All
            </button>
          )}
        </div>

        {isLoading ? (
          <SkeletonGrid count={10} />
        ) : items.length > 0 ? (
          <div className="movie-grid">
            {items.map((item) => (
              <MovieCard
                key={item._id}
                movie={{
                  id: item.movieId,
                  title: item.title,
                  poster_path: item.posterPath,
                  media_type: item.mediaType,
                }}
                mediaType={item.mediaType}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No watch history</h3>
            <p>Movies and shows you view will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
