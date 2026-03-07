import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPersonDetails, clearPersonDetails } from '../../features/movieSlice';
import { Loader } from '../../components/Loader/Loader';
import { getProfileUrl, getPosterUrl, formatDate } from '../../utils/helpers';
import './PersonDetails.css';

export default function PersonDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { personDetails: person, detailsLoading, error } = useSelector((state) => state.movies);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    dispatch(fetchPersonDetails(id));
    return () => dispatch(clearPersonDetails());
  }, [dispatch, id]);

  if (detailsLoading) return <Loader />;

  if (error && !person) {
    return (
      <div className="page person-details-page">
        <div className="container">
          <div className="empty-state">
            <h3>Could not load person details</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!person) return <Loader />;

  // Safely build knownFor list
  const castCredits = Array.isArray(person.credits?.cast) ? person.credits.cast : [];
  const crewCredits = Array.isArray(person.credits?.crew) ? person.credits.crew : [];
  const allCredits = [...castCredits, ...crewCredits];

  // Deduplicate by id + media_type, then sort by popularity
  const seen = new Set();
  const knownFor = allCredits
    .filter((item) => {
      if (!item || !item.id) return false;
      const key = `${item.id}-${item.media_type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 12);

  const bio = person.biography || '';
  const bioPreview = bio.length > 600 ? bio.substring(0, 600) + '...' : bio;
  const age = person.birthday
    ? Math.floor(
        (new Date() - new Date(person.birthday)) / (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="page person-details-page">
      <div className="container">
        <div className="person-grid">
          {/* Left: Photo & Info */}
          <div className="person-profile">
            <img
              src={getProfileUrl(person.profile_path)}
              alt={person.name || 'Person'}
              className="person-photo"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Photo'; }}
            />
            <div className="person-basic-info">
              <h3>Personal Info</h3>
              {person.known_for_department && (
                <div className="info-item">
                  <span className="info-label">Known For</span>
                  <span>{person.known_for_department}</span>
                </div>
              )}
              {person.gender != null && (
                <div className="info-item">
                  <span className="info-label">Gender</span>
                  <span>{person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Non-binary'}</span>
                </div>
              )}
              {person.birthday && (
                <div className="info-item">
                  <span className="info-label">Birthday</span>
                  <span>{formatDate(person.birthday)}{age ? ` (age ${age})` : ''}</span>
                </div>
              )}
              {person.deathday && (
                <div className="info-item">
                  <span className="info-label">Died</span>
                  <span>{formatDate(person.deathday)}</span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="info-item">
                  <span className="info-label">Place of Birth</span>
                  <span>{person.place_of_birth}</span>
                </div>
              )}
              {castCredits.length > 0 && (
                <div className="info-item">
                  <span className="info-label">Credits</span>
                  <span>{castCredits.length} roles</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Main content */}
          <div className="person-main">
            <h1 className="person-name">{person.name}</h1>

            {bio && (
              <div className="person-bio">
                <h3>Biography</h3>
                <p>{showFullBio ? bio : bioPreview}</p>
                {bio.length > 600 && (
                  <button
                    className="btn-read-more"
                    onClick={() => setShowFullBio(!showFullBio)}
                  >
                    {showFullBio ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}

            {knownFor.length > 0 && (
              <div className="person-known-for">
                <h3>Known For</h3>
                <div className="known-for-scroll">
                  {knownFor.map((item) => (
                    <Link
                      key={`${item.id}-${item.media_type || 'movie'}`}
                      to={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}`}
                      className="known-for-card"
                    >
                      <img
                        src={getPosterUrl(item.poster_path)}
                        alt={item.title || item.name || 'Untitled'}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster'; }}
                      />
                      <p className="known-for-title">{item.title || item.name || 'Untitled'}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
