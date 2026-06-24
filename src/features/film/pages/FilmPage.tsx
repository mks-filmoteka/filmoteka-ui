import {useParams, Link} from "react-router-dom";
import {useFilmQuery} from "../queries/useFilmQuery.ts";
import Poster from "../components/Poster.tsx";
import {formatParam} from "../utils/format.ts";
import "../../../shared/styles/details.css";

function FilmPage() {
    const {id} = useParams();
    const {data, isLoading, error} = useFilmQuery(id);

    if (!data) return <h1>Film not found</h1>;
    if (isLoading) return <h1>Loading...</h1>;

    if (error) {
        return (
            <div>
                <h1>
                    Error loading film
                </h1>
                {error.message}
            </div>
        );
    }

    return (
        <div>
            {/* TITLE */}
            <div className="page-title">
                <h1>{data?.title} ({data?.releaseYear})</h1>
                <div></div>
            </div>

            <hr/>

            <div className="main-grid">
                <div>
                    <Poster
                        src={data?.posterUrl}
                        alt={data?.title}
                    />
                </div>
                <div>
                    <p>{data?.description}</p>

                    <div>
                        <div className="details-column">
                            <div>
                                <span>Year</span>
                                {data?.releaseYear}
                            </div>
                            <div>
                                <span>Country</span>
                                {data?.country}
                            </div>
                            <div>
                                <span>Genre</span>
                                {data?.genres?.map(g => formatParam(g)).join(", ")}
                            </div>
                            <div>
                                <span>Director</span>
                                {data?.directors?.map((director) => (
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
                </div>

                {/* CAST */}
                <div>
                    <p><span>Cast</span></p>
                    <div className="people-column">
                        {data?.actors?.map(actor => (
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
        </div>
    );
}

export default FilmPage;