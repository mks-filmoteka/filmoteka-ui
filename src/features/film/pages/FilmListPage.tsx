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
                <div style={{
                    display: "flex",
                    gap: "8px",
                    margin: "20px auto",
                    width: "70%",
                    justifyContent: "flex-end" }}
                >
                    <button
                        onClick={() => setViewMode("list")}
                        title="List view"
                        style={{
                            fontSize: "22px",
                            cursor: "pointer",
                            opacity: viewMode === "list" ? 1 : 0.3,
                            width: "4%",
                            textAlign: "center",
                            color: "var(--text-color)",
                        }}
                    >
                        ☰
                    </button>

                    <button
                        onClick={() => setViewMode("grid")}
                        title="Grid view"
                        style={{
                            fontSize: "22px",
                            cursor: "pointer",
                            opacity: viewMode === "grid" ? 1 : 0.5,
                            width: "4%",
                            textAlign: "center",
                            color: "var(--text-color)",
                        }}
                    >
                        ▦
                    </button>
                </div>
            </div>
            {viewMode === "list" ? (
                <div style={{display: "flex", justifyContent: "center"}}>
                    <div className="item-list">
                        {data?.content.map((film, index) => (
                            <FilmListItem key={film.id} film={film} index={index}/>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="card-grid">
                    {data?.content.map((film, index) => (
                        <FilmCard
                            key={film.id}
                            film={film}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FilmListPage;