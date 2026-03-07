import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import movieReducer from '../features/movieSlice';
import favoriteReducer from '../features/favoriteSlice';
import historyReducer from '../features/historySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    favorites: favoriteReducer,
    history: historyReducer,
  },
});

export default store;
