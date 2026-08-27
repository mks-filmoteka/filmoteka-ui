import {useState} from "react";
import {useAuth} from "../../../auth/useAuth.ts";
import {FilmFormController} from "../components/FilmFormController.tsx";
import {FilmListScreen} from "../components/FilmListScreen.tsx";
import {useCreateFilm} from "../queries/useCreateFilm.ts";
import {useFilmListSearchState} from "../queries/useFilmListSearchState.ts";
import {useFilms} from "../queries/useFilms.ts";

function AllFilmsPage() {
    const isAdmin = useAuth().isAdmin;
    const [isCreating, setIsCreating] = useState(false);
    const createFilm = useCreateFilm();
    const search = useFilmListSearchState();
    const filmsQuery = useFilms(search.filmFilter);

    if (filmsQuery.isLoading) {
        return <h1>Loading...</h1>;
    }
    if (filmsQuery.error) {
        return <h1>Error loading films: {filmsQuery.error.message}</h1>;
    }
    if (isAdmin && isCreating) {
        return (
            <FilmFormController
                confirmMessage="Confirm create film?"
                isPending={createFilm.isPending}
                onCancel={() => setIsCreating(false)}
                onSave={(request, options) => createFilm.mutate({request}, options)}
            />
        );
    }

    return (
        <FilmListScreen
            filmsData={filmsQuery.data}
            search={search}
            title="Films"
            titleAction={isAdmin ? {
                title: "Add new film",
                onClick: () => setIsCreating(true)
            } : undefined}
        />
    );
}

export default AllFilmsPage;
