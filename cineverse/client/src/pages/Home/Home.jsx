import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlay, FiChevronRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { fetchTrending, fetchPopular, fetchPopularTV } from '../../features/movieSlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonGrid } from '../../components/Loader/Loader';
import { getBackdropUrl, truncateText, formatRating } from '../../utils/helpers';
import './Home.css';

export default function Home() {
  const dispatch = useDispatch();
  const { trending, popular, popularTV, isLoading } = useSelector((state) => state.movies);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchTrending('week'));
    dispatch(fetchPopular(1));
    dispatch(fetchPopularTV(1));
  }, [dispatch]);

  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % Math.min(trending.length, 5));
    }, 6000);
    return () => clearInterval(interval);
  }, [trending]);

  const heroMovie = trending[heroIndex];

  return (
    <div className="home-page">
      {/* Hero Section */}
      {heroMovie && (
        <section className="hero" style={{ backgroundImage: `url(${getBackdropUrl(heroMovie.backdrop_path)})` }}>
          <div className="hero-overlay" />
          <div className="hero-content container animate-fadeInUp">
            <div className="hero-badge">{heroMovie.media_type === 'tv' ? '📺 TV Show' : '🎬 Movie'}</div>
            <h1 className="hero-title">{heroMovie.title || heroMovie.name}</h1>
            <div className="hero-meta">
              <span className="hero-rating"><FaStar /> {formatRating(heroMovie.vote_average)}</span>
              <span>{(heroMovie.release_date || heroMovie.first_air_date || '').substring(0, 4)}</span>
            </div>
            <p className="hero-overview">{truncateText(heroMovie.overview, 250)}</p>
            <div className="hero-actions">
              <Link to={`/${heroMovie.media_type || 'movie'}/${heroMovie.id}`} className="btn btn-primary btn-lg">
                <FiPlay /> Watch Now
              </Link>
            </div>
            <div className="hero-dots">
              {trending.slice(0, 5).map((_, i) => (
                <button key={i} className={`dot ${i === heroIndex ? 'active' : ''}`} onClick={() => setHeroIndex(i)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="container section">
        <div className="section-header">
          <h2 className="section-title">🔥 <span className="accent">Trending</span> This Week</h2>
          <Link to="/movies" className="see-all">See All <FiChevronRight /></Link>
        </div>
        {isLoading && trending.length === 0 ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="movie-scroll">
            {trending.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} mediaType={movie.media_type || 'movie'} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Movies */}
      <section className="container section">
        <div className="section-header">
          <h2 className="section-title">🍿 Popular <span className="accent">Movies</span></h2>
          <Link to="/movies" className="see-all">See All <FiChevronRight /></Link>
        </div>
        {isLoading && popular.length === 0 ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="movie-scroll">
            {popular.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} mediaType="movie" />
            ))}
          </div>
        )}
      </section>

      {/* Popular TV Shows */}
      <section className="container section">
        <div className="section-header">
          <h2 className="section-title">📺 Popular <span className="accent">TV Shows</span></h2>
          <Link to="/tv" className="see-all">See All <FiChevronRight /></Link>
        </div>
        {isLoading && popularTV.length === 0 ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="movie-scroll">
            {popularTV.slice(0, 10).map((show) => (
              <MovieCard key={show.id} movie={show} mediaType="tv" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
