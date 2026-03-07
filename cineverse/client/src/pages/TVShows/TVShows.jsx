import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPopularTV, fetchGenres, discoverByGenre, clearGenreResults } from '../../features/movieSlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonGrid, InlineLoader } from '../../components/Loader/Loader';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import './Listing.css';

export default function TVShows() {
  const dispatch = useDispatch();
  const { popularTV, genres, genreResults, currentPage, totalPages, isLoading } = useSelector((state) => state.movies);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchGenres());
    dispatch(fetchPopularTV(1));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (isLoading || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    if (selectedGenre) {
      dispatch(discoverByGenre({ genreId: selectedGenre, page: nextPage, mediaType: 'tv' }));
    } else {
      dispatch(fetchPopularTV(nextPage));
    }
  }, [dispatch, isLoading, page, totalPages, selectedGenre]);

  const lastRef = useInfiniteScroll(loadMore, { hasMore: page < totalPages, isLoading });

  const handleGenreClick = (genreId) => {
    if (genreId === selectedGenre) {
      setSelectedGenre(null);
      setPage(1);
      dispatch(clearGenreResults());
      dispatch(fetchPopularTV(1));
    } else {
      setSelectedGenre(genreId);
      setPage(1);
      dispatch(clearGenreResults());
      dispatch(discoverByGenre({ genreId, page: 1, mediaType: 'tv' }));
    }
  };

  const shows = selectedGenre ? genreResults : popularTV;

  return (
    <div className="page listing-page">
      <div className="container">
        <h1 className="section-title">📺 <span className="accent">TV Shows</span></h1>
        <div className="genre-filter">
          {genres.tv.map((genre) => (
            <button key={genre.id} className={`genre-pill ${selectedGenre === genre.id ? 'active' : ''}`} onClick={() => handleGenreClick(genre.id)}>
              {genre.name}
            </button>
          ))}
        </div>
        {isLoading && shows.length === 0 ? (
          <SkeletonGrid count={20} />
        ) : (
          <>
            <div className="movie-grid">
              {shows.map((show, index) => (
                <div key={`${show.id}-${index}`} ref={index === shows.length - 1 ? lastRef : null}>
                  <MovieCard movie={show} mediaType="tv" />
                </div>
              ))}
            </div>
            {isLoading && <InlineLoader />}
          </>
        )}
      </div>
    </div>
  );
}
