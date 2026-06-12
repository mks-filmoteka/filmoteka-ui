import { useFilmsQuery } from "../queries/useFilmsQuery.ts";

function FilmListPage() {
    const { data, isLoading, error } = useFilmsQuery();

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
            <ul>
                {data?.content?.map((film) => (
                    <li key={film.id}>
                        {film.title} ({film.releaseYear})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FilmListPage;