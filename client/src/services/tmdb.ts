// frontend/src/services/tmdb.ts
//
// Thin client around The Movie Database (TMDB) API.
//
// Setup:
//   1. Create a free account at https://www.themoviedb.org/signup
//   2. Go to Settings → API → request an API key (choose "Developer")
//   3. Copy the "API Read Access Token" (the long v4 Bearer token,
//      NOT the short v3 api_key)
//   4. Add it to frontend/.env:
//        VITE_TMDB_API_TOKEN=your_token_here
//
// Note: Vite exposes VITE_-prefixed vars to the client bundle, so
// this token is visible in the browser. That's an accepted tradeoff
// for TMDB's free tier (it's rate-limited, not a security-sensitive
// key like the Supabase service role key). If you want it hidden,
// proxy these calls through the Express backend instead — see the
// note at the bottom of this file.

import type { Movie, Genre } from "../types/movie";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const API_TOKEN = import.meta.env.VITE_TMDB_API_TOKEN;

interface TMDBMovieRaw {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  if (!API_TOKEN) {
    throw new Error(
      "Missing VITE_TMDB_API_TOKEN. Add it to frontend/.env — see comment at the top of tmdb.ts.",
    );
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}): ${path}`);
  }

  return response.json();
}

function mapMovie(raw: TMDBMovieRaw): Movie {
  return {
    id: raw.id,
    title: raw.title,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    releaseDate: raw.release_date,
    voteAverage: raw.vote_average,
    genreIds: raw.genre_ids,
  };
}

/** Builds a full image URL from a TMDB path, or null if no image exists. */
export function getImageUrl(
  path: string | null,
  size: "w200" | "w342" | "w500" | "w780" | "original" = "w500",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/** This week's trending movies, used for the hero + "Trending Now" row. */
export async function getTrendingMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TMDBMovieRaw[] }>(
    "/trending/movie/week",
  );
  return data.results.map(mapMovie);
}

/** Full list of TMDB's official movie genres (e.g. Action, Comedy, Horror). */
export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list");
  return data.genres;
}

/** Popular movies within a single genre, used for each genre row. */
export async function getMoviesByGenre(genreId: number): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TMDBMovieRaw[] }>("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
  });
  return data.results.map(mapMovie);
}

// ── Optional: backend proxy alternative ──────────────────────
//
// To avoid shipping the TMDB token to the browser at all, add a
// mirrored set of routes on the Express backend (e.g. GET /api/movies/trending)
// that call TMDB server-side with the token in server/.env, then point
// TMDB_BASE_URL above at your own API instead. This also lets you cache
// responses in Supabase/Redis instead of re-hitting TMDB on every request.
