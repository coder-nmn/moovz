import { FiGithub, FiHeart } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <span className="logo-icon">🎬</span>
          <span className="footer-logo">Cine<span className="logo-accent">Verse</span></span>
          <p className="footer-tagline">Your universe of movies & TV shows</p>
        </div>
        <div className="footer-links">
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB API</a>
          <a href="https://github.com" target="_blank" rel="noreferrer"><FiGithub /> GitHub</a>
        </div>
        <div className="footer-bottom">
          <p>Made with <FiHeart className="heart-icon" /> by Moovz Team &copy; {new Date().getFullYear()}</p>
          <p className="footer-disclaimer">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </div>
    </footer>
  );
}
