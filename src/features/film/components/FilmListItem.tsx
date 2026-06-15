import type { FilmBasic } from "../types/filmBasic.ts";
import { useNavigate } from "react-router-dom";

type Props = {
    readonly film: FilmBasic;
    readonly index: number;
};

function FilmListItem({film, index}: Props) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(`/films/${film.id}`)}
            className="list-item-button"
        >
            {/* NUMBER COLUMN */}
            <span
                style={{
                    minWidth: "30px",
                    textAlign: "right",
                    color: "var(--text-color-f)"
                }}
            >
                {index + 1}.
            </span>

            {/* TITLE */}
            <span>
                {film.title} ({film.releaseYear})
            </span>
        </button>
    );
}

export default FilmListItem;