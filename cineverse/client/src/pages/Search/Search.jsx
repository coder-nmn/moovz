import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiX } from 'react-icons/fi';
import { searchMulti, clearSearchResults } from '../../features/movieSlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonGrid, InlineLoader } from '../../components/Loader/Loader';
import useDebounce from '../../hooks/useDebounce';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { getProfileUrl } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import './Search.css';

export default function Search() {
  const dispatch = useDispatch();
  const { searchResults, currentPage, totalPages, isLoading } = useSelector((state) => state.movies);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setPage(1);
      dispatch(searchMulti({ query: debouncedQuery, page: 1 }));
    } else {
      dispatch(clearSearchResults());
    }
  }, [debouncedQuery, dispatch]);

  const loadMore = useCallback(() => {
    if (isLoading || page >= totalPages || !debouncedQuery) return;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(searchMulti({ query: debouncedQuery, page: nextPage }));
  }, [dispatch, isLoading, page, totalPages, debouncedQuery]);

  const lastRef = useInfiniteScroll(loadMore, { hasMore: page < totalPages, isLoading });

  const clearSearch = () => {
    setQuery('');
    setPage(1);
    dispatch(clearSearchResults());
  };

  // Separate results by type
  const movies = searchResults.filter((r) => r.media_type === 'movie');
  const shows = searchResults.filter((r) => r.media_type === 'tv');
  const people = searchResults.filter((r) => r.media_type === 'person');

  return (
    <div className="page search-page">
      <div className="container">
        <div className="search-header">
          <h1 className="section-title">🔍 <span className="accent">Search</span></h1>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search movies, TV shows, people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button className="search-clear" onClick={clearSearch}><FiX /></button>
            )}
          </div>
        </div>

        {isLoading && searchResults.length === 0 ? (
          <SkeletonGrid count={10} />
        ) : searchResults.length > 0 ? (
          <>
            {/* People results */}
            {people.length > 0 && (
              <section className="search-section">
                <h2 className="section-title">👥 People</h2>
                <div className="people-results">
                  {people.slice(0, 6).map((person) => (
                    <Link key={person.id} to={`/person/${person.id}`} className="person-result">
                      <img src={getProfileUrl(person.profile_path)} alt={person.name} />
                      <div>
                        <p className="person-name">{person.name}</p>
                        <p className="person-dept">{person.known_for_department}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Movie & TV results in combined grid */}
            {(movies.length > 0 || shows.length > 0) && (
              <section className="search-section">
                <h2 className="section-title">🎬 Movies & TV Shows</h2>
                <div className="movie-grid">
                  {[...movies, ...shows].map((item, index) => (
                    <div key={`${item.id}-${item.media_type}`} ref={index === movies.length + shows.length - 1 ? lastRef : null}>
                      <MovieCard movie={item} mediaType={item.media_type} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            {isLoading && <InlineLoader />}
          </>
        ) : query.length >= 2 && !isLoading ? (
          <div className="empty-state">
            <h3>No results found</h3>
            <p>Try searching with different keywords.</p>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Start searching</h3>
            <p>Type at least 2 characters to search for movies, TV shows, and people.</p>
          </div>
        )}
      </div>
    </div>
  );
}
