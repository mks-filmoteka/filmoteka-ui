import { useParams } from "react-router-dom";
import { useFilmQuery } from "../queries/useFilmQuery.ts";

function FilmPage() {
    const { id } = useParams();

    const { data, isLoading, error } = useFilmQuery(id);

    if (isLoading) return <h1>Loading...</h1>;
    if (error) return <h1>Error loading film</h1>;

    return (
        <div style={{ padding: 20 }}>
            {/* TITLE */}
            <h1 style={{ textAlign: "center" }}>
                {data?.title} ({data?.releaseYear})
            </h1>

            <hr />

            {/* MAIN GRID */}
            <div
                style={{
                    textAlign: "left",
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
                            borderRadius: "8px"
                        }}
                    />
                </div>

                {/* DETAILS */}
                <div>
                    {/* description */}
                    <p style={{ lineHeight: 1.6, marginTop: 10 }}>
                        {data?.description}
                    </p>

                    <div style={{ height: 20 }} />

                    {/* DETAILS BLOCK */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div><b>Year:</b> {data?.releaseYear}</div>
                        <div><b>Country:</b> {data?.country}</div>
                        <div><b>Genre:</b> {data?.genres?.join(", ")}</div>
                        <div>
                            <b>Director:</b>{" "}
                            {data?.directors?.map(d => d.name).join(", ")}
                        </div>
                    </div>
                </div>

                {/* CAST */}
                <div>
                    <h3 style={{ margin: 0 }}>Cast</h3>

                    <div style={{
                        marginTop: 10,
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "15px" }}>
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