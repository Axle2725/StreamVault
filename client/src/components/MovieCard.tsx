// frontend/src/components/MovieCard.tsx
//
// A single poster tile. On hover, a glass-panel chip rises up
// showing the rating and release year, and the poster gets the
// same purple glow used on .sv-btn-secondary hover elsewhere.

import { Movie } from "../types/movie";
import { getImageUrl } from "../services/tmdb";
import "./MovieCard.css";

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  const posterUrl = getImageUrl(movie.posterPath, "w342");
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : "—";

  return (
    <button
      className="movie-card"
      onClick={() => onSelect?.(movie)}
      aria-label={`${movie.title}, ${year}`}
    >
      {posterUrl ? (
        <img
          className="movie-card__poster"
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
        />
      ) : (
        <div className="movie-card__poster movie-card__poster--placeholder">
          <span>{movie.title}</span>
        </div>
      )}

      <div className="movie-card__chip">
        <span className="movie-card__chip-rating">
          ★ {movie.voteAverage.toFixed(1)}
        </span>
        <span className="movie-card__chip-year">{year}</span>
      </div>

      <p className="movie-card__title">{movie.title}</p>
    </button>
  );
}
