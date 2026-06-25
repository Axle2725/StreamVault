// frontend/src/components/GenreRow.tsx
//
// Wraps MovieRow with its own data fetch for a single genre.
// Pulling this into its own component (rather than calling
// useMoviesByGenre in a loop inside Home) keeps each genre's
// query as a stable, independent hook call per component instance.

import type { Genre, Movie } from "../types/movie";
import { useMoviesByGenre } from "../hooks/useMovies";
import MovieRow from "./MovieRow";

interface GenreRowProps {
  genre: Genre;
  onSelectMovie?: (movie: Movie) => void;
}

export default function GenreRow({ genre, onSelectMovie }: GenreRowProps) {
  const { data: movies, isLoading } = useMoviesByGenre(genre.id);

  if (isLoading || !movies || movies.length === 0) return null;

  return (
    <MovieRow
      title={genre.name}
      movies={movies}
      onSelectMovie={onSelectMovie}
    />
  );
}
