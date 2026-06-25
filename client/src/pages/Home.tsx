// frontend/src/pages/Home.tsx
//
// The streaming-site landing page: a hero banner built from this
// week's #1 trending title, a "Trending Now" shelf for the rest of
// that list, then one shelf per TMDB genre — all sitting above the
// app's fixed aurora/grain/particle atmosphere.

import { useNavigate } from "react-router-dom";
import { useTrendingMovies, useGenres } from "../hooks/useMovies";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import GenreRow from "../components/GenreRow";
import type { Movie } from "../types/movie";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const {
    data: trending,
    isLoading: trendingLoading,
    error: trendingError,
  } = useTrendingMovies();
  const { data: genres, isLoading: genresLoading } = useGenres();

  const featured = trending?.[0];
  const trendingRest = trending?.slice(1) ?? [];

  const handleSelectMovie = (movie: Movie) => {
    navigate(`/watch/${movie.id}`);
  };

  return (
    <div className="home">
      {trendingError ? (
        <div className="home__error">
          <p>
            Couldn't load movies right now. Check your connection and try again.
          </p>
        </div>
      ) : (
        <>
          {trendingLoading && <div className="home__hero-skeleton" />}
          {featured && (
            <Hero
              movie={featured}
              onPlay={handleSelectMovie}
              onMoreInfo={handleSelectMovie}
            />
          )}

          <div className="home__rows">
            {trendingRest.length > 0 && (
              <MovieRow
                title="Trending Now"
                movies={trendingRest}
                onSelectMovie={handleSelectMovie}
              />
            )}

            {genresLoading && (
              <>
                <div className="home__row-skeleton" />
                <div className="home__row-skeleton" />
              </>
            )}

            {genres?.map((genre) => (
              <GenreRow
                key={genre.id}
                genre={genre}
                onSelectMovie={handleSelectMovie}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
