import { useState, useEffect } from 'react';
import './SplashScreen.css';

// Pre-compute particle positions (avoids impure Math.random in render)
const PARTICLES = Array.from({ length: 20 }, () => ({
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 2}s`,
  animationDuration: `${2 + Math.random() * 3}s`,
}));

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase('hold'), 800);
    const exitTimer = setTimeout(() => setPhase('exit'), 2400);
    const doneTimer = setTimeout(() => onComplete(), 3200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${phase}`}>
      <div className="splash-content">
        <div className="splash-logo">
          <span className="splash-icon">🎬</span>
          <h1 className="splash-title">
            Moo<span className="splash-accent">vz</span>
          </h1>
        </div>

        <p className="splash-tagline">Your universe of movies & TV shows</p>

        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>
      </div>

      <div className="splash-particles">
        {PARTICLES.map((style, i) => (
          <div key={i} className="particle" style={style} />
        ))}
      </div>
    </div>
  );
}
