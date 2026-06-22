import type {FilmBasic} from "../types/filmBasic.ts";
import {useNavigate} from "react-router-dom";
import {formatParam} from "../utils/format.ts";

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
            <span className="list-item-number">{index + 1}.</span>
            <span style={{marginRight: "auto"}}>{film.title} ({film.releaseYear})</span>
            <span className="item-label">{formatParam(film.genres[0])}</span>
        </button>
    );
}

export default FilmListItem;