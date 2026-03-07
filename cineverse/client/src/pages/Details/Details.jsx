import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlay, FiHeart, FiClock, FiStar, FiCalendar } from 'react-icons/fi';
import { FaHeart, FaStar, FaImdb } from 'react-icons/fa';
import { fetchMovieDetails, clearMovieDetails } from '../../features/movieSlice';
import { addFavorite, removeFavorite } from '../../features/favoriteSlice';
import { addToHistory } from '../../features/historySlice';
import TrailerModal from '../../components/TrailerModal/TrailerModal';
import MovieCard from '../../components/MovieCard/MovieCard';
import { Loader } from '../../components/Loader/Loader';
import { getBackdropUrl, getPosterUrl, getProfileUrl, formatDate, formatRating, getYouTubeTrailerKey } from '../../utils/helpers';
import './Details.css';

export default function Details() {
  const { id } = useParams();
  const mediaType = window.location.pathname.startsWith('/tv') ? 'tv' : 'movie';
  const dispatch = useDispatch();
  const { movieDetails: details, detailsLoading } = useSelector((state) => state.movies);
  const { user } = useSelector((state) => state.auth);
  const { favoritedIds } = useSelector((state) => state.favorites);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    dispatch(fetchMovieDetails({ id, mediaType }));
    // Add to watch history if logged in
    if (user) {
      dispatch(addToHistory({
        movieId: id,
        title: '',
        posterPath: '',
        mediaType,
        source: 'tmdb'
      }));
    }
    return () => dispatch(clearMovieDetails());
  }, [dispatch, id, mediaType, user]);

  // Update history with actual title when details load
  useEffect(() => {
    if (details && user) {
      dispatch(addToHistory({
        movieId: id,
        title: details.title || details.name || 'Unknown',
        posterPath: details.poster_path || '',
        mediaType,
        source: 'tmdb'
      }));
    }
  }, [details, dispatch, id, mediaType, user]);

  if (detailsLoading || !details) return <Loader />;

  const title = details.title || details.name || 'Unknown';
  const trailerKey = getYouTubeTrailerKey(details.videos);
  const isFavorited = favoritedIds[id];
  const runtime = details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : (details.episode_run_time?.[0] ? `${details.episode_run_time[0]}m/ep` : '');

  const handleFavoriteToggle = () => {
    if (!user) return;
    if (isFavorited) {
      dispatch(removeFavorite(id));
    } else {
      dispatch(addFavorite({
        movieId: id,
        title,
        posterPath: details.poster_path || '',
        rating: details.vote_average || 0,
        releaseDate: details.release_date || details.first_air_date || '',
        mediaType,
        source: 'tmdb'
      }));
    }
  };

  return (
    <div className="details-page">
      {/* ─── Bounded Hero (contains backdrop image + always-dark overlay) ─── */}
      <div
        className="details-backdrop"
        style={{ backgroundImage: `url(${getBackdropUrl(details.backdrop_path)})` }}
      >
        <div className="backdrop-overlay" />
        <div className="details-hero-content container">
          <div className="details-grid">
            {/* Poster */}
            <div className="details-poster">
              <img
                src={getPosterUrl(details.poster_path)}
                alt={title}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster'; }}
              />
            </div>

            {/* Info */}
            <div className="details-info">
              <h1 className="details-title">{title}</h1>
              {details.tagline && <p className="details-tagline">"{details.tagline}"</p>}

              <div className="details-meta">
                <span className="meta-item rating"><FaStar /> {formatRating(details.vote_average)}</span>
                <span className="meta-item"><FiCalendar /> {formatDate(details.release_date || details.first_air_date)}</span>
                {runtime && <span className="meta-item"><FiClock /> {runtime}</span>}
              </div>

              <div className="details-genres">
                {details.genres?.map((g) => (
                  <span key={g.id} className="genre-tag">{g.name}</span>
                ))}
              </div>

              <div className="details-actions">
                <button className="btn btn-primary btn-lg" onClick={() => setShowTrailer(true)}>
                  <FiPlay /> Watch Trailer
                </button>
                {user && (
                  <button className={`btn btn-secondary btn-lg ${isFavorited ? 'favorited' : ''}`} onClick={handleFavoriteToggle}>
                    {isFavorited ? <FaHeart /> : <FiHeart />}
                    {isFavorited ? 'Favorited' : 'Add to Favorites'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content below hero on solid background ─── */}
      <div className="container details-content">
        <div className="details-below-hero">
          {/* Overview */}
          <div className="details-overview">
            <h3>Overview</h3>
            <p>{details.overview || 'Description not available'}</p>
          </div>

          {/* Watch Providers */}
          {details.watchProviders?.['IN'] && (
            <div className="watch-providers">
              <h3>Where to Watch</h3>
              {details.watchProviders['IN'].flatrate ? (
                <div className="provider-list">
                  <p className="provider-type">Stream:</p>
                  <div className="provider-icons">
                    {details.watchProviders['IN'].flatrate.map((provider) => (
                      <a key={provider.provider_id} href={details.watchProviders['IN'].link} target="_blank" rel="noopener noreferrer" className="provider-item" title={provider.provider_name}>
                        <img src={`${import.meta.env.VITE_TMDB_IMAGE_BASE}/w45${provider.logo_path}`} alt={provider.provider_name} />
                      </a>
                    ))}
                  </div>
                </div>
              ) : details.watchProviders['IN'].buy || details.watchProviders['IN'].rent ? (
                <div className="provider-list">
                  <p className="provider-type">Rent/Buy:</p>
                  <div className="provider-icons">
                    {[...(details.watchProviders['IN'].buy || []), ...(details.watchProviders['IN'].rent || [])]
                      .filter((v, i, a) => a.findIndex(t => t.provider_id === v.provider_id) === i)
                      .map((provider) => (
                        <a key={provider.provider_id} href={details.watchProviders['IN'].link} target="_blank" rel="noopener noreferrer" className="provider-item" title={provider.provider_name}>
                          <img src={`${import.meta.env.VITE_TMDB_IMAGE_BASE}/w45${provider.logo_path}`} alt={provider.provider_name} />
                        </a>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="no-providers">No streaming information available for your region.</p>
              )}
              <p className="provider-notice">Provided by JustWatch</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="details-extra">
            {details.status && <div className="extra-item"><span className="extra-label">Status</span><span>{details.status}</span></div>}
            {details.budget > 0 && <div className="extra-item"><span className="extra-label">Budget</span><span>${(details.budget / 1000000).toFixed(1)}M</span></div>}
            {details.revenue > 0 && <div className="extra-item"><span className="extra-label">Revenue</span><span>${(details.revenue / 1000000).toFixed(1)}M</span></div>}
            {details.number_of_seasons && <div className="extra-item"><span className="extra-label">Seasons</span><span>{details.number_of_seasons}</span></div>}
          </div>
        </div>

        {/* Cast */}
        {details.credits?.cast?.length > 0 && (
          <section className="details-section">
            <h2 className="section-title">👥 <span className="accent">Cast</span></h2>
            <div className="cast-scroll">
              {details.credits.cast.slice(0, 15).map((person) => (
                <Link key={person.id} to={`/person/${person.id}`} className="cast-card">
                  <img src={getProfileUrl(person.profile_path)} alt={person.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/185x278?text=No+Image'; }} />
                  <div className="cast-info">
                    <p className="cast-name">{person.name}</p>
                    <p className="cast-character">{person.character}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {details.similar?.length > 0 && (
          <section className="details-section">
            <h2 className="section-title">🎯 <span className="accent">Similar</span> {mediaType === 'tv' ? 'Shows' : 'Movies'}</h2>
            <div className="movie-grid">
              {details.similar.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} mediaType={mediaType} />
              ))}
            </div>
          </section>
        )}
      </div>

      {showTrailer && <TrailerModal videoKey={trailerKey} onClose={() => setShowTrailer(false)} />}
    </div>
  );
}
