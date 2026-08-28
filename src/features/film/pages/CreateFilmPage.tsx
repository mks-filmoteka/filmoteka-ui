import {useNavigate} from "react-router";
import {FilmForm} from "../components/FilmForm.tsx";
import {useCreateFilm} from "../queries/useCreateFilm.ts";

function CreateFilmPage() {
    const navigate = useNavigate();
    const createFilm = useCreateFilm();

    return (
        <FilmForm
            confirmMessage="Confirm create film?"
            isPending={createFilm.isPending}
            isChanged={() => true}
            onCancel={() => navigate("/films")}
            onSave={(request, options) =>
                createFilm.mutate(
                    {request},
                    {
                        onSuccess: () => {
                            options.onSuccess();
                            navigate("/films");
                        },
                        onError: options.onError
                    }
                )
            }
        />
    );
}

export default CreateFilmPage;
