import type {FilmBasic} from "../types/filmBasic.ts";
import {useNavigate} from "react-router";
import "../../../shared/styles/item.css";

type Props = {
    readonly film: FilmBasic;
    readonly index: number;
    readonly checked?: boolean;
    readonly onCheckedChange?: (filmId: number, checked: boolean) => void;
    readonly selectionDisabled?: boolean;
};

function FilmListItem({film, index, checked, onCheckedChange, selectionDisabled}: Props) {
    const navigate = useNavigate();

    const content = (
        <>
            <span className="list-item-number">{index + 1}</span>
            <span style={{marginRight: "auto"}}>{film.title} ({film.releaseYear})</span>
            <span className="item-label">{film.genres[0]}</span>
            {onCheckedChange && (
                <input
                    type="checkbox"
                    className="film-selection-checkbox"
                    aria-label={`Select ${film.title}`}
                    checked={!!checked}
                    disabled={selectionDisabled}
                    onChange={(event) =>
                        onCheckedChange(film.id, event.currentTarget.checked)}
                />
            )}
        </>
    );

    if (onCheckedChange) {
        return (
            <div className="list-item-button">
                {content}
            </div>
        );
    }

    return (
        <button
            onClick={() => navigate(`/films/${film.id}`)}
            className="list-item-button"
        >
            {content}
        </button>
    );
}

export default FilmListItem;
