import { useParams } from "react-router-dom";
import { useFilmQuery } from "../queries/useFilmQuery.ts";

function FilmPage() {
    const { id } = useParams();
    const { data, isLoading, error } = useFilmQuery(id);
    const formatGenre = (g: string) => g.charAt(0) + g.slice(1).toLowerCase();

    if (isLoading) return <h1>Loading...</h1>;
    if (error) return <h1>Error loading film</h1>;

    return (
        <div>
            {/* TITLE */}
            <h1>{data?.title} ({data?.releaseYear})</h1>

            <hr />

            {/* MAIN GRID */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "300px 1fr 170px",
                    gap: "20px",
                    alignItems: "start"
                }}
            >
                {/* POSTER */}
                <div>
                    <img
                        src={data?.posterUrl}
                        alt={data?.title}
                        style={{
                            width: "100%",
                            borderRadius: "8px",
                        }}
                    />
                </div>

                {/* DETAILS */}
                <div>
                    {/* description */}
                    <p>
                        {data?.description}
                    </p>


                    {/* DETAILS BLOCK */}
                    <div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "flex" }}>
                                <span style={{ width: 90, color: "var(--text-color-f)" }}>Year:</span>
                                <span>{data?.releaseYear}</span>
                            </div>
                            <div style={{ display: "flex" }}>
                                <span style={{ width: 90, color: "var(--text-color-f)" }}>Country:</span>
                                <span>{data?.country}</span>
                            </div>
                            <div style={{ display: "flex" }}>
                                <span style={{ width: 90, color: "var(--text-color-f)" }}>Genre:</span>
                                <span>{data?.genres?.map(g => formatGenre(g)).join(", ")}</span>
                            </div>
                            <div style={{ display: "flex" }}>
                                <span style={{ width: 90, color: "var(--text-color-f)" }}>Director:</span>
                                <span>
                                    {data?.directors?.map(d => d.name).join(", ")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CAST */}
                <div>
                    <p style={{  color: "var(--text-color-f)" }}>
                        Cast
                    </p>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "var(--font-s)" }}>
                        {data?.actors?.map(actor => (
                            <div key={actor.id}>
                                {actor.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FilmPage;