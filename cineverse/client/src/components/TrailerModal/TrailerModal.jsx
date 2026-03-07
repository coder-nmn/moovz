import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './TrailerModal.css';

export default function TrailerModal({ videoKey, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!videoKey) {
    return (
      <div className="trailer-modal-overlay" onClick={onClose}>
        <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
          <button className="trailer-close" onClick={onClose}><FiX /></button>
          <div className="trailer-unavailable">
            <p>🎬 Trailer for this movie is currently unavailable.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trailer-modal-overlay" onClick={onClose}>
      <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="trailer-close" onClick={onClose}><FiX /></button>
        <div className="trailer-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
            title="Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
