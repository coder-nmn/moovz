import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '../../features/favoriteSlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonGrid } from '../../components/Loader/Loader';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title"><FiHeart style={{ color: 'var(--accent-primary)' }} /> My <span className="accent">Favorites</span></h1>

        {isLoading ? (
          <SkeletonGrid count={10} />
        ) : items.length > 0 ? (
          <div className="movie-grid">
            {items.map((fav) => (
              <MovieCard
                key={fav._id}
                movie={{
                  id: fav.movieId,
                  title: fav.title,
                  poster_path: fav.posterPath,
                  vote_average: fav.rating,
                  release_date: fav.releaseDate,
                  media_type: fav.mediaType,
                }}
                mediaType={fav.mediaType}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No favorites yet</h3>
            <p>Start adding movies to your favorites by clicking the heart icon.</p>
            <Link to="/movies" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Movies</Link>
          </div>
        )}
      </div>
    </div>
  );
}
