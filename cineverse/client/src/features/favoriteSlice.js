import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import backendApi from '../api/backend';

export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (_, { rejectWithValue }) => {
  try {
    const res = await backendApi.get('/favorites');
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
  }
});

export const addFavorite = createAsyncThunk('favorites/addFavorite', async (movie, { rejectWithValue }) => {
  try {
    const res = await backendApi.post('/favorites', movie);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add favorite');
  }
});

export const removeFavorite = createAsyncThunk('favorites/removeFavorite', async (movieId, { rejectWithValue }) => {
  try {
    await backendApi.delete(`/favorites/${movieId}`);
    return movieId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove favorite');
  }
});

export const checkFavorite = createAsyncThunk('favorites/checkFavorite', async (movieId, { rejectWithValue }) => {
  try {
    const res = await backendApi.get(`/favorites/check/${movieId}`);
    return { movieId, isFavorited: res.data.isFavorited };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Check failed');
  }
});

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],
    favoritedIds: {},
    isLoading: false,
    error: null,
  },
  reducers: {
    clearFavorites: (state) => {
      state.items = [];
      state.favoritedIds = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.favoritedIds = {};
        action.payload.forEach((fav) => { state.favoritedIds[fav.movieId] = true; });
      })
      .addCase(fetchFavorites.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.favoritedIds[action.payload.movieId] = true;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.movieId !== action.payload);
        delete state.favoritedIds[action.payload];
      })
      .addCase(checkFavorite.fulfilled, (state, action) => {
        state.favoritedIds[action.payload.movieId] = action.payload.isFavorited;
      });
  },
});

export const { clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
