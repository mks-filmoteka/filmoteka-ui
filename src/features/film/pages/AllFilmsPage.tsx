import { useNavigate } from "react-router";
import { useAuth } from "../../../auth/useAuth.ts";
import { FilmBrowser } from "../components/FilmBrowser.tsx";
import { useFilms } from "../queries/useFilms.ts";
import { PageHeader } from "../../../shared/components/PageHeader.tsx";
import { useFilmApiParams } from "../queries/useFilmApiParams.ts";
import { ApiErrorMessage } from "../../../shared/components/ApiErrorMessage.tsx";
import { IconButton } from "../../../shared/components/IconButton.tsx";

function AllFilmsPage() {
    const navigate = useNavigate();
    const isAdmin = useAuth().isAdmin;
    const search = useFilmApiParams();
    const filmsQuery = useFilms(search.filmFilter);

    if (filmsQuery.isLoading) {
        return <h1>Loading...</h1>;
    }
    if (filmsQuery.error) {
        return <ApiErrorMessage error={filmsQuery.error} message="Error loading films" />;
    }

    return (
        <div>
            <PageHeader
                title="Films"
                controls={
                    isAdmin && <IconButton icon="create" label="Add new film" onClick={() => navigate("/films/new")} />
                }
            />
            <hr />
            <FilmBrowser filmsData={filmsQuery.data} search={search} />
        </div>
    );
}

export default AllFilmsPage;
