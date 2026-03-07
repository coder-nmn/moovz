import { useState, useEffect } from 'react';
import { FiUsers, FiFilm, FiHeart, FiClock, FiPlus, FiEdit2, FiTrash2, FiShield, FiSlash, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import backendApi from '../../api/backend';
import './Admin.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [movieForm, setMovieForm] = useState({ title: '', posterUrl: '', description: '', tmdbId: '', releaseDate: '', trailerUrl: '', genre: '', category: 'movie', rating: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'movies') fetchMovies();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await backendApi.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      setMessage('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await backendApi.get('/admin/users', { params: { search: searchTerm } });
      setUsers(res.data.users);
    } catch (err) {
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await backendApi.get('/movies', { params: { search: searchTerm } });
      setMovies(res.data.movies);
    } catch (err) {
      setMessage('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const res = await backendApi.put(`/admin/users/${userId}/ban`);
      setMessage(res.data.message);
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    try {
      await backendApi.delete(`/admin/users/${userId}`);
      setMessage('User deleted');
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...movieForm, genre: movieForm.genre.split(',').map((g) => g.trim()).filter(Boolean), rating: parseFloat(movieForm.rating) || 0 };
      if (editingId) {
        await backendApi.put(`/movies/${editingId}`, data);
        setMessage('Movie updated!');
      } else {
        await backendApi.post('/movies', data);
        setMessage('Movie added!');
      }
      setMovieForm({ title: '', posterUrl: '', description: '', tmdbId: '', releaseDate: '', trailerUrl: '', genre: '', category: 'movie', rating: '' });
      setEditingId(null);
      fetchMovies();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEditMovie = (movie) => {
    setMovieForm({
      title: movie.title,
      posterUrl: movie.posterUrl || '',
      description: movie.description || '',
      tmdbId: movie.tmdbId || '',
      releaseDate: movie.releaseDate || '',
      trailerUrl: movie.trailerUrl || '',
      genre: (movie.genre || []).join(', '),
      category: movie.category || 'movie',
      rating: movie.rating?.toString() || '',
    });
    setEditingId(movie._id);
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Delete this movie?')) return;
    try {
      await backendApi.delete(`/movies/${movieId}`);
      setMessage('Movie deleted');
      fetchMovies();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiShield /> },
    { id: 'movies', label: 'Movies', icon: <FiFilm /> },
    { id: 'users', label: 'Users', icon: <FiUsers /> },
  ];

  return (
    <div className="page admin-page">
      <div className="container">
        <h1 className="section-title"><FiShield style={{ color: 'var(--accent-purple)' }} /> Admin <span className="accent">Panel</span></h1>

        {message && <div className="admin-message">{message}</div>}

        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button key={tab.id} className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="admin-dashboard">
            <div className="stat-cards">
              <div className="stat-card"><div className="stat-icon users-icon"><FiUsers /></div><div><p className="stat-number">{stats.totalUsers}</p><p className="stat-label">Users</p></div></div>
              <div className="stat-card"><div className="stat-icon movies-icon"><FiFilm /></div><div><p className="stat-number">{stats.totalMovies}</p><p className="stat-label">Movies</p></div></div>
              <div className="stat-card"><div className="stat-icon favs-icon"><FiHeart /></div><div><p className="stat-number">{stats.totalFavorites}</p><p className="stat-label">Favorites</p></div></div>
              <div className="stat-card"><div className="stat-icon history-icon"><FiClock /></div><div><p className="stat-number">{stats.totalHistory}</p><p className="stat-label">Watch History</p></div></div>
            </div>
            {stats.recentUsers?.length > 0 && (
              <div className="recent-users">
                <h3>Recent Users</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                    <tbody>
                      {stats.recentUsers.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Movies Tab */}
        {activeTab === 'movies' && (
          <div className="admin-movies">
            <form className="movie-form" onSubmit={handleMovieSubmit}>
              <h3>{editingId ? 'Edit Movie' : 'Add New Movie'}</h3>
              <div className="form-row">
                <div className="form-group"><label>Title *</label><input className="form-control" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} required /></div>
                <div className="form-group"><label>Category</label><select className="form-control" value={movieForm.category} onChange={(e) => setMovieForm({ ...movieForm, category: e.target.value })}><option value="movie">Movie</option><option value="tv">TV Show</option></select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Poster Image URL</label><input className="form-control" value={movieForm.posterUrl} onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })} /></div>
                <div className="form-group"><label>Trailer YouTube Link</label><input className="form-control" value={movieForm.trailerUrl} onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })} placeholder="https://youtu.be/..." /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows="3" value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Release Date</label><input type="date" className="form-control" value={movieForm.releaseDate} onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })} /></div>
                <div className="form-group"><label>Rating (0-10)</label><input type="number" min="0" max="10" step="0.1" className="form-control" value={movieForm.rating} onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })} /></div>
                <div className="form-group"><label>TMDB ID</label><input className="form-control" value={movieForm.tmdbId} onChange={(e) => setMovieForm({ ...movieForm, tmdbId: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Genres (comma-separated)</label><input className="form-control" value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} placeholder="Action, Drama, Thriller" /></div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{editingId ? <><FiEdit2 /> Update</> : <><FiPlus /> Add Movie</>}</button>
                {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setMovieForm({ title: '', posterUrl: '', description: '', tmdbId: '', releaseDate: '', trailerUrl: '', genre: '', category: 'movie', rating: '' }); }}><FiX /> Cancel</button>}
              </div>
            </form>

            <div className="admin-list">
              <h3>Admin Movies ({movies.length})</h3>
              {movies.length === 0 ? <p className="no-data">No movies added yet.</p> : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead><tr><th>Title</th><th>Category</th><th>Rating</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {movies.map((m) => (
                        <tr key={m._id}>
                          <td className="movie-title-cell">
                            {m.posterUrl && <img src={m.posterUrl} alt="" className="table-poster" />}
                            {m.title}
                          </td>
                          <td><span className="cat-badge">{m.category}</span></td>
                          <td>{m.rating || 'N/A'}</td>
                          <td>{m.releaseDate || 'N/A'}</td>
                          <td className="action-cell">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEditMovie(m)}><FiEdit2 /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMovie(m._id)}><FiTrash2 /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="admin-search">
              <FiSearch className="search-icon" />
              <input className="form-control" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} />
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                      <td><span className={`status-badge ${u.isBanned ? 'banned' : 'active'}`}>{u.isBanned ? 'Banned' : 'Active'}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="action-cell">
                        {u.role !== 'admin' && (
                          <>
                            <button className={`btn btn-sm ${u.isBanned ? 'btn-outline' : 'btn-secondary'}`} onClick={() => handleBanUser(u._id)} title={u.isBanned ? 'Unban' : 'Ban'}>
                              {u.isBanned ? <FiCheck /> : <FiSlash />}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)} title="Delete"><FiTrash2 /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
