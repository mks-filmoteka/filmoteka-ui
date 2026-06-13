import type { Film } from "../types/film";
import { useNavigate } from "react-router-dom";

type Props = {
    readonly film: Film;
    readonly index: number;
};

function FilmListItem({ film, index }: Props) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(`/films/${film.id}`)}
            style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
                padding: "8px 0"
            }}
        >
            {index + 1}. {film.title} ({film.releaseYear})
        </button>
    );
}

export default FilmListItem;