import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import backendApi from '../api/backend';

export const fetchHistory = createAsyncThunk('history/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const res = await backendApi.get('/history');
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
  }
});

export const addToHistory = createAsyncThunk('history/addToHistory', async (movie, { rejectWithValue }) => {
  try {
    const res = await backendApi.post('/history', movie);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add to history');
  }
});

export const clearAllHistory = createAsyncThunk('history/clearAllHistory', async (_, { rejectWithValue }) => {
  try {
    await backendApi.delete('/history');
    return [];
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear history');
  }
});

const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearHistory: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => { state.isLoading = true; })
      .addCase(fetchHistory.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchHistory.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(addToHistory.fulfilled, (state, action) => {
        state.items = state.items.filter((h) => h.movieId !== action.payload.movieId);
        state.items.unshift(action.payload);
      })
      .addCase(clearAllHistory.fulfilled, (state) => { state.items = []; });
  },
});

export const { clearHistory } = historySlice.actions;
export default historySlice.reducer;
