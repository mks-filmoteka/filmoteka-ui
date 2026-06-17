import type {FilmBasic} from "../types/filmBasic.ts";
import {useNavigate} from "react-router-dom";
import Poster from "./Poster.tsx";

type Props = {
    readonly film: FilmBasic;
    readonly index: number;
};

function FilmCard({film, index}: Props) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(`/films/${film.id}`)}
            className="card-button"
        >
            <div className="card-number">
                {index + 1}
            </div>
            <Poster
                src={film.posterUrl}
                alt={film.title}
            />
            <div>
                <div className="card-title">
                    {film.title}
                </div>
            </div>
            <div className="card-number">
                {film.releaseYear}
            </div>
        </button>
    );
}

export default FilmCard;