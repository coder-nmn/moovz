import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPopular, fetchGenres, discoverByGenre, clearGenreResults } from '../../features/movieSlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonGrid, InlineLoader } from '../../components/Loader/Loader';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import './Listing.css';

export default function Movies() {
  const dispatch = useDispatch();
  const { popular, genres, genreResults, currentPage, totalPages, isLoading } = useSelector((state) => state.movies);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchGenres());
    dispatch(fetchPopular(1));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (isLoading || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    if (selectedGenre) {
      dispatch(discoverByGenre({ genreId: selectedGenre, page: nextPage }));
    } else {
      dispatch(fetchPopular(nextPage));
    }
  }, [dispatch, isLoading, page, totalPages, selectedGenre]);

  const lastRef = useInfiniteScroll(loadMore, { hasMore: page < totalPages, isLoading });

  const handleGenreClick = (genreId) => {
    if (genreId === selectedGenre) {
      setSelectedGenre(null);
      setPage(1);
      dispatch(clearGenreResults());
      dispatch(fetchPopular(1));
    } else {
      setSelectedGenre(genreId);
      setPage(1);
      dispatch(clearGenreResults());
      dispatch(discoverByGenre({ genreId, page: 1 }));
    }
  };

  const movies = selectedGenre ? genreResults : popular;

  return (
    <div className="page listing-page">
      <div className="container">
        <h1 className="section-title">🎬 <span className="accent">Movies</span></h1>

        {/* Genre Filter */}
        <div className="genre-filter">
          {genres.movie.map((genre) => (
            <button key={genre.id} className={`genre-pill ${selectedGenre === genre.id ? 'active' : ''}`} onClick={() => handleGenreClick(genre.id)}>
              {genre.name}
            </button>
          ))}
        </div>

        {isLoading && movies.length === 0 ? (
          <SkeletonGrid count={20} />
        ) : (
          <>
            <div className="movie-grid">
              {movies.map((movie, index) => (
                <div key={`${movie.id}-${index}`} ref={index === movies.length - 1 ? lastRef : null}>
                  <MovieCard movie={movie} mediaType="movie" />
                </div>
              ))}
            </div>
            {isLoading && <InlineLoader />}
            {movies.length === 0 && !isLoading && (
              <div className="empty-state">
                <h3>No movies found</h3>
                <p>Try selecting a different genre.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
