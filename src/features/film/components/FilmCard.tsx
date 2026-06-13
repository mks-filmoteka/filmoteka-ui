import type { Film } from "../types/film";
import { useNavigate } from "react-router-dom";

type Props = {
    readonly film: Film;
};

function FilmCard({ film }: Props) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(`/films/${film.id}`)}
            style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
                border: "1px solid gray",
                padding: "12px",
                borderRadius: "8px"
            }}
        >
            <img
                src={film.posterUrl}
                alt={film.title}
                width={150}
            />

            <h3>{film.title}</h3>

            <p>{film.releaseYear}</p>
        </button>
    );
}

export default FilmCard;