import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tmdbApi from '../api/tmdb';

// Fetch trending
export const fetchTrending = createAsyncThunk('movies/fetchTrending', async (timeWindow = 'week', { rejectWithValue }) => {
  try {
    const res = await tmdbApi.get(`/trending/all/${timeWindow}`);
    return res.data.results;
  } catch (error) {
    return rejectWithValue(error.response?.data?.status_message || 'Failed to fetch trending');
  }
});

// Fetch popular movies
export const fetchPopular = createAsyncThunk('movies/fetchPopular', async (page = 1, { rejectWithValue }) => {
  try {
    const res = await tmdbApi.get('/movie/popular', { params: { page } });
    return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages };
  } catch (error) {
    return rejectWithValue(error.response?.data?.status_message || 'Failed to fetch popular');
  }
});

// Fetch popular TV
export const fetchPopularTV = createAsyncThunk('movies/fetchPopularTV', async (page = 1, { rejectWithValue }) => {
  try {
    const res = await tmdbApi.get('/tv/popular', { params: { page } });
    return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages };
  } catch (error) {
    return rejectWithValue(error.response?.data?.status_message || 'Failed to fetch TV shows');
  }
});

// Fetch movie details
export const fetchMovieDetails = createAsyncThunk('movies/fetchMovieDetails', async ({ id, mediaType = 'movie' }, { rejectWithValue }) => {
  try {
    const [details, credits, videos, similar, providers] = await Promise.all([
      tmdbApi.get(`/${mediaType}/${id}`),
      tmdbApi.get(`/${mediaType}/${id}/credits`),
      tmdbApi.get(`/${mediaType}/${id}/videos`),
      tmdbApi.get(`/${mediaType}/${id}/similar`),
      tmdbApi.get(`/${mediaType}/${id}/watch/providers`),
    ]);
    return {
      ...details.data,
      credits: credits.data,
      videos: videos.data.results,
      similar: similar.data.results,
      watchProviders: providers.data.results,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.status_message || 'Failed to fetch details');
  }
});

// Search multi
export const searchMulti = createAsyncThunk('movies/searchMulti', async ({ query, page = 1 }, { rejectWithValue }) => {
  try {
    const res = await tmdbApi.get('/search/multi', { params: { query, page } });
    return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages, query };
  } catch (error) {
    return rejectWithValue(error.response?.data?.status_message || 'Search failed');
  }
});

// Fetch popular people
export const fetchPopularPeople = createAsyncThunk('movies/fetchPopularPeople', async (page = 1, { rejectWithValue }) => {
  try {
    const res = await tmdbApi.get('/person/popular', { params: { page } });
    return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages };
  } catch (error) {
    return rejectWithValue(error.response?.data?.status_message || 'Failed to fetch people');
  }
});

// Fetch person details
export const fetchPersonDetails = createAsyncThunk('movies/fetchPersonDetails', async (id, { rejectWithValue }) => {
  try {
    const [details, credits, images] = await Promise.all([
      tmdbApi.get(`/person/${id}`),
      tmdbApi.get(`/person/${id}/combined_credits`),
      tmdbApi.get(`/person/${id}/images`),
    ]);
    return { ...details.data, credits: credits.data, images: images.data.profiles };
  } catch (error) {
    return rejectWithValue(error.response?.data?.status_message || 'Failed to fetch person');
  }
});

// Fetch genres
export const fetchGenres = createAsyncThunk('movies/fetchGenres', async (_, { rejectWithValue }) => {
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      tmdbApi.get('/genre/movie/list'),
      tmdbApi.get('/genre/tv/list'),
    ]);
    return { movie: movieGenres.data.genres, tv: tvGenres.data.genres };
  } catch (error) {
    return rejectWithValue('Failed to fetch genres');
  }
});

// Discover by genre
export const discoverByGenre = createAsyncThunk('movies/discoverByGenre', async ({ genreId, page = 1, mediaType = 'movie' }, { rejectWithValue }) => {
  try {
    const res = await tmdbApi.get(`/discover/${mediaType}`, { params: { with_genres: genreId, page, sort_by: 'popularity.desc' } });
    return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages };
  } catch (error) {
    return rejectWithValue('Failed to discover movies');
  }
});

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    trending: [],
    popular: [],
    popularTV: [],
    searchResults: [],
    movieDetails: null,
    personDetails: null,
    people: [],
    genres: { movie: [], tv: [] },
    genreResults: [],
    currentPage: 1,
    totalPages: 1,
    searchQuery: '',
    isLoading: false,
    detailsLoading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.currentPage = 1;
      state.totalPages = 1;
    },
    clearMovieDetails: (state) => {
      state.movieDetails = null;
    },
    clearPersonDetails: (state) => {
      state.personDetails = null;
    },
    clearGenreResults: (state) => {
      state.genreResults = [];
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Trending
      .addCase(fetchTrending.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTrending.fulfilled, (state, action) => { state.isLoading = false; state.trending = action.payload; })
      .addCase(fetchTrending.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Popular
      .addCase(fetchPopular.pending, (state) => { state.isLoading = true; })
      .addCase(fetchPopular.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popular = action.payload.page === 1 ? action.payload.results : [...state.popular, ...action.payload.results];
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPopular.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Popular TV
      .addCase(fetchPopularTV.pending, (state) => { state.isLoading = true; })
      .addCase(fetchPopularTV.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popularTV = action.payload.page === 1 ? action.payload.results : [...state.popularTV, ...action.payload.results];
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPopularTV.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Movie Details
      .addCase(fetchMovieDetails.pending, (state) => { state.detailsLoading = true; })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => { state.detailsLoading = false; state.movieDetails = action.payload; })
      .addCase(fetchMovieDetails.rejected, (state, action) => { state.detailsLoading = false; state.error = action.payload; })
      // Search
      .addCase(searchMulti.pending, (state) => { state.isLoading = true; })
      .addCase(searchMulti.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.page === 1 ? action.payload.results : [...state.searchResults, ...action.payload.results];
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.searchQuery = action.payload.query;
      })
      .addCase(searchMulti.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // People
      .addCase(fetchPopularPeople.pending, (state) => { state.isLoading = true; })
      .addCase(fetchPopularPeople.fulfilled, (state, action) => {
        state.isLoading = false;
        state.people = action.payload.page === 1 ? action.payload.results : [...state.people, ...action.payload.results];
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPopularPeople.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Person Details
      .addCase(fetchPersonDetails.pending, (state) => { state.detailsLoading = true; })
      .addCase(fetchPersonDetails.fulfilled, (state, action) => { state.detailsLoading = false; state.personDetails = action.payload; })
      .addCase(fetchPersonDetails.rejected, (state, action) => { state.detailsLoading = false; state.error = action.payload; })
      // Genres
      .addCase(fetchGenres.fulfilled, (state, action) => { state.genres = action.payload; })
      // Discover by genre
      .addCase(discoverByGenre.pending, (state) => { state.isLoading = true; })
      .addCase(discoverByGenre.fulfilled, (state, action) => {
        state.isLoading = false;
        state.genreResults = action.payload.page === 1 ? action.payload.results : [...state.genreResults, ...action.payload.results];
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(discoverByGenre.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });
  },
});

export const { clearSearchResults, clearMovieDetails, clearPersonDetails, clearGenreResults } = movieSlice.actions;
export default movieSlice.reducer;
