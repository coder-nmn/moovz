import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPopularPeople } from '../../features/movieSlice';
import { getProfileUrl } from '../../utils/helpers';
import { SkeletonGrid, InlineLoader } from '../../components/Loader/Loader';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import './People.css';

export default function People() {
  const dispatch = useDispatch();
  const { people, currentPage, totalPages, isLoading } = useSelector((state) => state.movies);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPopularPeople(1));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (isLoading || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(fetchPopularPeople(nextPage));
  }, [dispatch, isLoading, page, totalPages]);

  const lastRef = useInfiniteScroll(loadMore, { hasMore: page < totalPages, isLoading });

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">👥 Popular <span className="accent">People</span></h1>

        {isLoading && people.length === 0 ? (
          <SkeletonGrid count={20} />
        ) : (
          <>
            <div className="people-grid">
              {people.map((person, index) => (
                <Link key={`${person.id}-${index}`} to={`/person/${person.id}`} className="person-card" ref={index === people.length - 1 ? lastRef : null}>
                  <div className="person-img-wrapper">
                    <img src={getProfileUrl(person.profile_path)} alt={person.name} loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/185x278?text=No+Image'; }} />
                  </div>
                  <h3 className="person-card-name">{person.name}</h3>
                  <p className="person-card-dept">{person.known_for_department}</p>
                </Link>
              ))}
            </div>
            {isLoading && <InlineLoader />}
          </>
        )}
      </div>
    </div>
  );
}
