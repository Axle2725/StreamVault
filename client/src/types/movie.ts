// frontend/src/types/movie.ts
//
// Shared shapes for movie data, normalised from TMDB's raw
// snake_case API responses into the camelCase fields the rest
// of the app works with.

export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
}

export interface Genre {
  id: number;
  name: string;
}
