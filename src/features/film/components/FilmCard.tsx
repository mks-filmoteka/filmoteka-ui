import type { FilmBasic } from "../types/filmBasic.ts";
import { useNavigate } from "react-router-dom";

type Props = {
    readonly film: FilmBasic;
    readonly index: number;
};

function FilmCard({ film, index }: Props) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(`/films/${film.id}`)}
            style={{
                display: "grid",
                gridTemplateRows: "20px 1fr 55px 35px",
                overflow: "hidden",
                boxSizing: "border-box",
                maxWidth: "266px"
            }}
        >
            {/* 1. NUMBER */}
            <div
                style={{
                    fontSize: "var(--font-s)",
                    color: "var(--text-color-f)",
                    lineHeight: 1,
                    padding: "3px 10px"
                }}
            >
                {index + 1}
            </div>

            {/* POSTER AREA */}
            <img
                src={film.posterUrl}
                alt={film.title}
                style={{
                    aspectRatio: "2 / 3",
                    background: "var(--accent)",
                    borderRadius: "5px",
                    width: "100%",
                    justifySelf: "stretch"
                }}
            />

            {/* 3. TITLE */}
            <div
                style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    padding: "3px 10px",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "1.22",
                    alignSelf: "flex-start"
                }}
            >
                {film.title}
            </div>

            {/* 4. YEAR */}
            <div
                style={{
                    fontSize: "var(--font-s)",
                    color: "var(--text-color-f)",
                    alignSelf: "end",
                    padding: "5px 8px",
                }}
            >
                {film.releaseYear}
            </div>
        </button>
    );
}

export default FilmCard;