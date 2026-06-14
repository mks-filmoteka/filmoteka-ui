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
            style={{
                display: "flex",
                gap: "20px",
                padding: "4px 10px",
                boxSizing: "border-box",
            }}
        >
            {/* NUMBER COLUMN */}
            <span
                style={{
                    width: "20px",
                    textAlign: "right",
                    color: "var(--text-color-f)"
                }}
            >
                {index + 1}.
            </span>

            {/* TITLE */}
            <span style={{ textAlign: "left" }}>
                {film.title} ({film.releaseYear})
            </span>
        </button>
    );
}

export default FilmListItem;