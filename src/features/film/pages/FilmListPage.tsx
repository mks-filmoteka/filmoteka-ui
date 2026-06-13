import { useFilmsQuery } from "../queries/useFilmsQuery.ts";
import { useState } from "react";
import  FilmCard  from "../components/FilmCard.tsx"
import FilmListItem from "../components/FilmListItem";

function FilmListPage() {
    const { data, isLoading, error } = useFilmsQuery();
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    console.log("films:", data);

    if (isLoading) {
        return <h1>loading...</h1>;
    }
    if (error) {
        return <h1>error loading films</h1>;
    }
    return (
        <div>
            <h1>Films</h1>
            <div>
                <button onClick={() => setViewMode("list")}>
                    List
                </button>

                <button onClick={() => setViewMode("grid")}>
                    Grid
                </button>
            </div>
            {viewMode === "list" ? (
                <div style={{ textAlign: "left" }}>
                    {data?.content.map((film, index) => (
                        <FilmListItem
                            key={film.id}
                            film={film}
                            index={index}
                        />
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "20px"
                    }}
                >
                    {data?.content.map((film) => (
                        <FilmCard
                            key={film.id}
                            film={film}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FilmListPage;