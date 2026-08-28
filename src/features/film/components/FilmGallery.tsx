import type {FilmBasic} from "../types/filmBasic.ts";
import FilmListItem from "./FilmListItem.tsx";
import FilmCard from "./FilmCard.tsx";

type Props = {
    films: FilmBasic[];
    view: string;
    startIndex?: number;
    selectedFilmIds?: ReadonlySet<number>;
    onFilmCheckedChange?: (filmId: number, checked: boolean) => void;
    selectionDisabled?: boolean;
};

export function FilmGallery(props: Readonly<Props>) {
    const {
        films,
        view,
        startIndex = 0,
        selectedFilmIds,
        onFilmCheckedChange,
        selectionDisabled
    } = props;

    const {ItemComponent, containerClass} = view === "list"
        ? {ItemComponent: FilmListItem, containerClass: "item-list"}
        : {ItemComponent: FilmCard, containerClass: "card-grid"};

    let filmsContent;
    if (films.length === 0) {
        filmsContent = <h1>No films found</h1>;
    } else {
        filmsContent = (
            <div className={containerClass}>
                {films.map((film, index) => (
                    <ItemComponent
                        key={film.id}
                        film={film}
                        index={index + startIndex}
                        checked={selectedFilmIds?.has(film.id)}
                        onCheckedChange={onFilmCheckedChange}
                        selectionDisabled={selectionDisabled}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="item-list-wrapper">
            {filmsContent}
        </div>
    );
}
