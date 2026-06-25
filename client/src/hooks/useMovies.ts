// frontend/src/hooks/useMovies.ts
//
// React Query hooks wrapping the TMDB service. Stale times are
// generous since movie catalogues and genre listings change slowly —
// no need to refetch every time a component remounts.

import { useQuery } from "@tanstack/react-query";
import {
  getTrendingMovies,
  getGenres,
  getMoviesByGenre,
} from "../services/tmdb";

const THIRTY_MINUTES = 1000 * 60 * 30;

export function useTrendingMovies() {
  return useQuery({
    queryKey: ["movies", "trending"],
    queryFn: getTrendingMovies,
    staleTime: THIRTY_MINUTES,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: Infinity, // genre list essentially never changes
  });
}

export function useMoviesByGenre(genreId: number) {
  return useQuery({
    queryKey: ["movies", "genre", genreId],
    queryFn: () => getMoviesByGenre(genreId),
    staleTime: THIRTY_MINUTES,
  });
}
