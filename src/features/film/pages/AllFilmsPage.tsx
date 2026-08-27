import {useNavigate} from "react-router";
import {useAuth} from "../../../auth/useAuth.ts";
import {FilmListScreen} from "../components/FilmListScreen.tsx";
import {useFilmListSearchState} from "../queries/useFilmListSearchState.ts";
import {useFilms} from "../queries/useFilms.ts";
import {PageHeader} from "../../../shared/components/PageHeader.tsx";

function AllFilmsPage() {
    const navigate = useNavigate();
    const isAdmin = useAuth().isAdmin;
    const search = useFilmListSearchState();
    const filmsQuery = useFilms(search.filmFilter);

    if (filmsQuery.isLoading) {
        return <h1>Loading...</h1>;
    }
    if (filmsQuery.error) {
        return <h1>Error loading films: {filmsQuery.error.message}</h1>;
    }

    return (
        <div>
            <PageHeader
                title="Films"
                controls={isAdmin && (
                    <button
                        title="Add new film"
                        onClick={() => navigate("/films/new")}
                    >
                        ✚
                    </button>
                )}
            />
            <hr/>
            <FilmListScreen
                filmsData={filmsQuery.data}
                search={search}
            />
        </div>
    );
}

export default AllFilmsPage;
