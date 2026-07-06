import type {Film} from "../types/film.ts";
import Poster from "../../media/components/Poster.tsx";
import {Link} from "react-router-dom";
import {getFileUrl} from "../../media/api/mediaApi.ts";

type Props = {
    data: Film;
    isAdmin: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

export function FilmDetails(props: Readonly<Props>) {
    const { data, isAdmin, onEdit, onDelete } = props;
    return (
        <>
            <div className="page-title">
                <h1>{data.title} ({data.releaseYear})</h1>
                <div>
                    {data.genres[0] ?? ""}
                    <div className="page-title-controls">
                        {isAdmin && (
                            <>
                                <button title="Edit" onClick={onEdit}>
                                    ✎
                                </button>
                                <button title="Delete" onClick={onDelete}>
                                    🗑
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <hr />

            <div className="main-grid">
                <Poster
                    src={data.posterName ? getFileUrl(data.posterName) : null}
                    alt={data.title}
                />
                <div>
                    <p>{data.description}</p>
                    <div className="details-column">
                        <div>
                            <span>Year</span>
                            {data.releaseYear}
                        </div>

                        <div>
                            <span>Country</span>
                            {data.countries.join(", ")}
                        </div>

                        <div>
                            <span>Genre</span>
                            {data.genres.join(", ")}
                        </div>

                        <div>
                            <span>Director</span>
                            {data.directors.map((director) => (
                                <Link
                                    key={director.id}
                                    to={`/people/director/${director.id}`}
                                    className="person-link person-link--line"
                                >
                                    {director.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div>
                    <p><span>Cast</span></p>
                    <div className="people-column">
                        {data.actors.map((actor) => (
                            <Link
                                key={actor.id}
                                to={`/people/actor/${actor.id}`}
                                className="person-link"
                            >
                                {actor.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}