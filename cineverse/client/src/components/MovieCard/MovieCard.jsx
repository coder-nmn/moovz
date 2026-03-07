import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import { addFavorite, removeFavorite } from '../../features/favoriteSlice';
import { getPosterUrl, formatRating } from '../../utils/helpers';
import './MovieCard.css';

export default function MovieCard({ movie, mediaType = 'movie' }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { favoritedIds } = useSelector((state) => state.favorites);

  const id = movie.id || movie._id;
  const title = movie.title || movie.name || 'Untitled';
  const poster = movie.poster_path ? getPosterUrl(movie.poster_path) : (movie.posterUrl || getPosterUrl(null));
  const rating = movie.vote_average || movie.rating || 0;
  const year = (movie.release_date || movie.first_air_date || movie.releaseDate || '').substring(0, 4);
  const type = movie.media_type || mediaType;
  const source = movie.source || 'tmdb';
  const isFavorited = favoritedIds[id?.toString()];

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    if (isFavorited) {
      dispatch(removeFavorite(id.toString()));
    } else {
      dispatch(addFavorite({
        movieId: id.toString(),
        title,
        posterPath: movie.poster_path || '',
        rating,
        releaseDate: movie.release_date || movie.first_air_date || '',
        mediaType: type,
        source,
      }));
    }
  };

  const linkPath = source === 'admin' ? `/admin-movie/${id}` : `/${type}/${id}`;

  return (
    <Link to={linkPath} className="movie-card animate-fadeIn">
      <div className="movie-card-poster">
        <img src={poster} alt={title} loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster'; }} />
        <div className="card-overlay">
          <div className="card-rating">
            <FaStar className="star-icon" />
            <span>{formatRating(rating)}</span>
          </div>
          {user && (
            <button className={`card-fav-btn ${isFavorited ? 'active' : ''}`} onClick={handleFavorite}>
              {isFavorited ? <FaHeart /> : <FiHeart />}
            </button>
          )}
        </div>
        {type && <span className="card-badge">{type === 'tv' ? 'TV' : 'Movie'}</span>}
      </div>
      <div className="movie-card-info">
        <h3 className="card-title">{title}</h3>
        {year && <span className="card-year">{year}</span>}
      </div>
    </Link>
  );
}
