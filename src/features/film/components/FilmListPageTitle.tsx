import type {Collection} from "../../collection/types/collection.ts";

type Props = {
    source: "films" | "collection";
    collection?: Collection;
    isAdmin: boolean;
    isEditingCollectionFilms: boolean;
    onCreateFilm: () => void;
    onAddFilmsToCollection: () => void;
};

export function FilmListPageTitle(props: Readonly<Props>) {
    const {
        source,
        collection,
        isAdmin,
        isEditingCollectionFilms,
        onAddFilmsToCollection,
        onCreateFilm
    } = props;
    const isCollection = source === "collection";
    const title = isCollection ? collection?.name : "Films";
    const showAddFilmsToCollection = isCollection && !isEditingCollectionFilms;
    const showCreateFilm = !isCollection && isAdmin;

    return (
        <div className="page-title">
            <h1>{title}</h1>
            <div>
                <div></div>
                <div className="page-title-controls">
                    {showAddFilmsToCollection && (
                        <button
                            title="Add films to collection"
                            onClick={onAddFilmsToCollection}
                            disabled={!collection}
                        >
                            ✚
                        </button>
                    )}
                    {showCreateFilm && (
                        <button
                            title="Add new film"
                            onClick={onCreateFilm}
                        >
                            ✚
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
