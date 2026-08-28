import {useNavigate} from "react-router";
import {useAuth} from "../../../auth/useAuth.ts";
import {FilmBrowser} from "../components/FilmBrowser.tsx";
import {useFilms} from "../queries/useFilms.ts";
import {PageHeader} from "../../../shared/components/PageHeader.tsx";
import {useFilmApiParams} from "../queries/useFilmApiParams.ts";
import {ApiErrorMessage} from "../../../shared/components/ApiErrorMessage.tsx";

function AllFilmsPage() {
    const navigate = useNavigate();
    const isAdmin = useAuth().isAdmin;
    const search = useFilmApiParams();
    const filmsQuery = useFilms(search.filmFilter);

    if (filmsQuery.isLoading) {
        return <h1>Loading...</h1>;
    }
    if (filmsQuery.error) {
        return <ApiErrorMessage error={filmsQuery.error} message="Error loading films"/>;
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
            <FilmBrowser
                filmsData={filmsQuery.data}
                search={search}
            />
        </div>
    );
}

export default AllFilmsPage;
