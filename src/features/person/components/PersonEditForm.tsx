import { useState } from "react";
import ImageUpload from "../../media/components/ImageUpload.tsx";
import { useUploadFile } from "../../media/queries/useUploadFile.ts";
import { deleteFile } from "../../media/api/mediaApi.ts";
import { TextInput } from "../../../shared/components/TextInput.tsx";
import { IconButton } from "../../../shared/components/IconButton.tsx";
import { ApiErrorMessage } from "../../../shared/components/ApiErrorMessage.tsx";
import { INPUT_RULES } from "../../../shared/utils/inputValidation.ts";
import { useConfirm } from "../../../shared/utils/useConfirm.ts";
import { getApiError } from "../../../shared/api/apiError.ts";
import type { ApiError } from "../../../shared/types/ApiError.ts";
import { useUpdatePerson } from "../queries/useUpdatePerson.ts";
import type { Person } from "../types/person.ts";
import type { PersonRequest } from "../types/personRequest.ts";
import { getLifespanError } from "../utils/lifespan.ts";
import { PersonCard } from "./PersonCard.tsx";

type Props = {
    person: Person;
    roles: string;
    onDone: () => void;
};

export function PersonEditForm({ person, roles, onDone }: Readonly<Props>) {
    const confirm = useConfirm();
    const updatePerson = useUpdatePerson();
    const uploadPhoto = useUploadFile();
    const [name, setName] = useState(person.name);
    const [birthDate, setBirthDate] = useState(person.birthDate ?? "");
    const [deathDate, setDeathDate] = useState(person.deathDate ?? "");
    const [placeOfBirth, setPlaceOfBirth] = useState(person.placeOfBirth ?? "");
    const [photoName, setPhotoName] = useState(person.photoName);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [apiError, setApiError] = useState<ApiError | Error>();

    const toRequest = (savedPhotoName: string | null): PersonRequest => ({
        name: name.trim(),
        birthDate: birthDate || null,
        deathDate: deathDate || null,
        placeOfBirth: placeOfBirth.trim() || null,
        photoName: savedPhotoName,
    });
    const original: PersonRequest = {
        name: person.name,
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        placeOfBirth: person.placeOfBirth,
        photoName: person.photoName,
    };
    const request = toRequest(photoName);
    const dateError = getLifespanError(request.birthDate ?? null, request.deathDate ?? null);
    const isChanged = photoFile !== null || JSON.stringify(request) !== JSON.stringify(original);
    const pending = updatePerson.isPending || uploadPhoto.isPending;
    const saveDisabled = !isChanged || !request.name || !!dateError || pending;
    const today = new Date().toLocaleDateString("en-CA");

    const save = (savedPhotoName: string | null, uploadedPhotoName?: string) => {
        updatePerson.mutate(
            { id: person.id, request: toRequest(savedPhotoName) },
            {
                onSuccess: onDone,
                onError: (error: Error) => {
                    if (uploadedPhotoName) {
                        deleteFile(uploadedPhotoName).catch(() => {});
                    }
                    setApiError(getApiError(error));
                },
            },
        );
    };

    const handleSave = async () => {
        if (saveDisabled || !(await confirm("Confirm person update?"))) return;
        if (!photoFile) {
            save(photoName);
            return;
        }
        uploadPhoto.mutate(photoFile, {
            onSuccess: (uploaded) => save(uploaded.fileName, uploaded.fileName),
            onError: (error: Error) => setApiError(getApiError(error)),
        });
    };

    return (
        <PersonCard
            photo={
                <ImageUpload
                    value={photoName}
                    alt={name || "Person photo"}
                    onChange={setPhotoName}
                    file={photoFile}
                    setFile={setPhotoFile}
                    removeLabel="Remove photo"
                    disabled={pending}
                />
            }
            name={
                <TextInput
                    id="name-edit"
                    ariaLabel="edit name"
                    value={name}
                    maxLength={100}
                    onChange={setName}
                    regex={INPUT_RULES.name}
                    placeholder="Name"
                />
            }
            details={
                <>
                    {roles && (
                        <div>
                            <span>Roles</span>
                            {roles}
                        </div>
                    )}
                    <div>
                        <span>Born</span>
                        <input
                            type="date"
                            aria-label="birth date"
                            value={birthDate}
                            min="1850-01-01"
                            max={today}
                            onChange={(event) => setBirthDate(event.target.value)}
                        />
                    </div>
                    <div>
                        <span>Died</span>
                        <input
                            type="date"
                            aria-label="death date"
                            value={deathDate}
                            min="1850-01-01"
                            max={today}
                            onChange={(event) => setDeathDate(event.target.value)}
                        />
                    </div>
                    <div>
                        <span>Birthplace</span>
                        <TextInput
                            ariaLabel="birthplace"
                            value={placeOfBirth}
                            maxLength={255}
                            onChange={setPlaceOfBirth}
                            regex={INPUT_RULES.title}
                            placeholder="City, country"
                        />
                    </div>
                </>
            }
            controls={
                <>
                    <IconButton icon="accept" label="Save" onClick={handleSave} disabled={saveDisabled} />
                    <IconButton icon="cancel" label="Cancel" onClick={onDone} />
                </>
            }
        >
            {dateError && (
                <div className="api-error-message" role="alert">
                    {dateError}
                </div>
            )}
            <ApiErrorMessage error={apiError} />
        </PersonCard>
    );
}
