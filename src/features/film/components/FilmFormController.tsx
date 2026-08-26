import type {AxiosError} from "axios";
import {useState} from "react";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import {useDeleteFile} from "../../media/queries/useDeleteFile.ts";
import {useUploadFile} from "../../media/queries/useUploadFile.ts";
import type {Film} from "../types/film.ts";
import type {FilmRequest} from "../types/filmRequest.ts";
import {fillForm, fillRequest} from "../utils/formState.ts";
import {FilmForm} from "./FilmForm.tsx";

type SaveOptions = {
    onSuccess: () => void;
    onError: (error: Error) => void;
};

type Props = {
    confirmMessage: string;
    onCancel: () => void;
    onSave: (request: FilmRequest, options: SaveOptions) => void;
    initialFilm?: Film;
    isPending?: boolean;
    isChanged?: (form: FilmRequest, posterFile: File | null) => boolean;
};

export function FilmFormController(props: Readonly<Props>) {
    const {
        confirmMessage,
        onCancel,
        onSave,
        initialFilm,
        isPending,
        isChanged
    } = props;
    const [form, setForm] = useState<FilmRequest>(() => fillForm(initialFilm));
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [apiError, setApiError] = useState<ApiError | Error>();
    const uploadPoster = useUploadFile();
    const deletePoster = useDeleteFile();

    const handleError = (error: Error) => {
        const err = error as AxiosError<ApiError>;
        setApiError(err.response?.data ?? error);
    };

    const closeForm = () => {
        setForm(fillForm(initialFilm));
        setPosterFile(null);
        setApiError(undefined);
        onCancel();
    };

    const saveFilm = (request: FilmRequest, uploadedPosterName?: string) => {
        onSave(request, {
            onSuccess: closeForm,
            onError: (error: Error) => {
                if (uploadedPosterName) {
                    deletePoster.mutate(uploadedPosterName);
                }
                handleError(error);
            }
        });
    };

    const handleSave = () => {
        if (!confirm(confirmMessage)) return;
        const request = fillRequest(form);

        if (!posterFile) {
            saveFilm(request);
            return;
        }
        uploadPoster.mutate(
            posterFile, {
                onSuccess: (uploadedPoster) => {
                    saveFilm({
                        ...request,
                        posterName: uploadedPoster.fileName
                    }, uploadedPoster.fileName);
                },
                onError: handleError
            }
        );
    };

    return (
        <FilmForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={closeForm}
            isChanged={isChanged?.(form, posterFile)}
            isPending={isPending || uploadPoster.isPending}
            apiError={apiError}
            posterFile={posterFile}
            setPosterFile={setPosterFile}
        />
    );
}
