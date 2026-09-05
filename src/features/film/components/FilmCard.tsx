import type { FilmBasic } from "../types/filmBasic.ts";
import { useNavigate } from "react-router";
import Poster from "../../media/components/Poster.tsx";
import { getFileUrl } from "../../media/api/mediaApi.ts";

type Props = {
    readonly film: FilmBasic;
    readonly index: number;
    readonly checked?: boolean;
    readonly onCheckedChange?: (filmId: number, checked: boolean) => void;
    readonly selectionDisabled?: boolean;
};

function FilmCard({ film, index, checked, onCheckedChange, selectionDisabled }: Props) {
    const navigate = useNavigate();

    const content = (
        <>
            <div className="card-number">
                <span>{index + 1}</span>
                {onCheckedChange && (
                    <input
                        type="checkbox"
                        className="film-selection-checkbox"
                        aria-label={`Select ${film.title}`}
                        checked={!!checked}
                        disabled={selectionDisabled}
                        onChange={(event) => onCheckedChange(film.id, event.currentTarget.checked)}
                    />
                )}
            </div>
            <Poster src={film.posterName ? getFileUrl(film.posterName) : null} alt={film.title} />
            <div>
                <div className="card-title">{film.title}</div>
            </div>
            <div className="card-number">
                <span>{film.releaseYear}</span>
                <span>{film.genres[0]}</span>
            </div>
        </>
    );

    if (onCheckedChange) {
        return <div className="card-button">{content}</div>;
    }

    return (
        <button onClick={() => navigate(`/films/${film.id}`)} className="card-button">
            {content}
        </button>
    );
}

export default FilmCard;
