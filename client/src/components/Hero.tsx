// frontend/src/components/Hero.tsx
//
// Full-bleed banner built around the #1 trending title. Play/More
// Info reuse the app's existing .sv-btn system rather than custom
// button styles — Play maps to .sv-btn-primary (crimson, same as
// Login) and More Info to .sv-btn-secondary (purple, same as
// Register), keeping the primary/secondary meaning consistent
// across the whole app.

import { Movie } from "../types/movie";
import { getImageUrl } from "../services/tmdb";
import "./Hero.css";

interface HeroProps {
  movie: Movie;
  onPlay?: (movie: Movie) => void;
  onMoreInfo?: (movie: Movie) => void;
}

export default function Hero({ movie, onPlay, onMoreInfo }: HeroProps) {
  const backdropUrl = getImageUrl(movie.backdropPath, "original");
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : "—";

  return (
    <section
      className="hero"
      style={
        backdropUrl ? { backgroundImage: `url(${backdropUrl})` } : undefined
      }
    >
      <div className="hero__overlay" />

      <div className="hero__content">
        <span className="hero__eyebrow">Trending This Week</span>
        <h1 className="hero__title">{movie.title}</h1>

        <div className="hero__meta">
          <span className="hero__meta-rating">
            ★ {movie.voteAverage.toFixed(1)}
          </span>
          <span className="hero__meta-dot">•</span>
          <span>{year}</span>
        </div>

        <p className="hero__overview">{movie.overview}</p>

        <div className="hero__actions">
          <button
            className="sv-btn sv-btn-primary"
            onClick={() => onPlay?.(movie)}
          >
            ▶ Play
          </button>
          <button
            className="sv-btn sv-btn-secondary"
            onClick={() => onMoreInfo?.(movie)}
          >
            More Info
          </button>
        </div>
      </div>
    </section>
  );
}
