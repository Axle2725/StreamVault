// frontend/src/components/MovieRow.tsx
//
// A horizontally-scrolling shelf of movie cards, used for both the
// "Trending Now" row and every genre row. Uses the app's existing
// .sv-reveal utility so each row fades/slides up as it enters the
// viewport, same as the scroll-reveal behaviour elsewhere in the app.

import type { Movie } from "../types/movie";
import { useScrollReveal } from "../hooks/useScrollReveal";
import MovieCard from "./MovieCard";
import "./MovieRow.css";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onSelectMovie?: (movie: Movie) => void;
}

export default function MovieRow({
  title,
  movies,
  onSelectMovie,
}: MovieRowProps) {
  // sectionRef does double duty: useScrollReveal observes it for the
  // fade-in, and scrollBy() reaches into it to find the scrollable track.
  const sectionRef = useScrollReveal<HTMLElement>();

  const scrollBy = (direction: "left" | "right") => {
    const track =
      sectionRef.current?.querySelector<HTMLDivElement>(".movie-row__track");
    if (!track) return;
    const amount = track.clientWidth * 0.8 * (direction === "left" ? -1 : 1);
    track.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (movies.length === 0) return null;

  return (
    <section className="movie-row sv-reveal" ref={sectionRef}>
      <div className="movie-row__header">
        <h2 className="movie-row__title">{title}</h2>
        <span className="movie-row__title-bar" aria-hidden="true" />
      </div>

      <div className="movie-row__viewport">
        <button
          className="movie-row__arrow movie-row__arrow--left"
          onClick={() => scrollBy("left")}
          aria-label={`Scroll ${title} left`}
        >
          ‹
        </button>

        <div className="movie-row__track">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
          ))}
        </div>

        <button
          className="movie-row__arrow movie-row__arrow--right"
          onClick={() => scrollBy("right")}
          aria-label={`Scroll ${title} right`}
        >
          ›
        </button>
      </div>
    </section>
  );
}
