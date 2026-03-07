import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ChatBot from './components/ChatBot/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader } from './components/Loader/Loader';
import './App.css';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home/Home'));
const Movies = lazy(() => import('./pages/Movies/Movies'));
const TVShows = lazy(() => import('./pages/TVShows/TVShows'));
const Details = lazy(() => import('./pages/Details/Details'));
const Search = lazy(() => import('./pages/Search/Search'));
const People = lazy(() => import('./pages/People/People'));
const PersonDetails = lazy(() => import('./pages/PersonDetails/PersonDetails'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites'));
const History = lazy(() => import('./pages/History/History'));
const Admin = lazy(() => import('./pages/Admin/Admin'));

// Auth pages
const LoginModule = import('./pages/Auth/Auth');
const Login = lazy(() => LoginModule.then(m => ({ default: m.default })));
const Signup = lazy(() => LoginModule.then(m => ({ default: m.Signup })));

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/tv" element={<TVShows />} />
                <Route path="/movie/:id" element={<Details />} />
                <Route path="/tv/:id" element={<Details />} />
                <Route path="/search" element={<Search />} />
                <Route path="/people" element={<People />} />
                <Route path="/person/:id" element={<PersonDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <ChatBot />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
