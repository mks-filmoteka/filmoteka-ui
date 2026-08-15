import {useState} from "react";
import type {AxiosError} from "axios";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import "../../../shared/styles/popup.css";
import "../../../shared/styles/details.css";
import {useUpdateProfile} from "../queries/useUpdateProfile.ts";
import type {UserProfile} from "../types/userProfile.ts";

type Props = {
    profile: UserProfile;
    onClose: () => void;
};

export function ProfileDetails({profile, onClose}: Readonly<Props>) {
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(profile.displayName);
    const [apiError, setApiError] = useState<ApiError | Error>();
    const updateProfile = useUpdateProfile();
    const trimmedDisplayName = displayName.trim();
    const isChanged = trimmedDisplayName !== profile.displayName.trim();
    const isInvalid = !trimmedDisplayName;

    const startEditing = () => {
        setApiError(undefined);
        setDisplayName(profile.displayName);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setApiError(undefined);
        setDisplayName(profile.displayName);
        setIsEditing(false);
    };

    const handleSave = () => {
        if (!isChanged || isInvalid || updateProfile.isPending) return;
        if (!confirm("Confirm changes?")) return;

        updateProfile.mutate(
            {displayName: trimmedDisplayName},
            {
                onSuccess: (updatedProfile) => {
                    setApiError(undefined);
                    setDisplayName(updatedProfile.displayName);
                    setIsEditing(false);
                },
                onError: (error: Error) => {
                    const err = error as AxiosError<ApiError>;
                    setApiError(err.response?.data ?? error);
                }
            }
        );
    };

    return (
        <div
            className="filter-overlay"
            onClick={onClose}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    onClose();
                }
            }}
            role="presentation"
        >
            <div
                className="filter-popup"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="filter-section-header">
                    <span>Profile details</span>
                </div>

                <hr/>

                <div className="details-column profile-details">
                    <div>
                        <span>Email</span>
                        {profile.email}
                    </div>

                    <div>
                        <span>Display name</span>
                        <div className="array-editor-row">
                            {isEditing ? (
                                <TextInput
                                    id="profile-display-name"
                                    ariaLabel="edit display name"
                                    value={displayName}
                                    onChange={setDisplayName}
                                    maxLength={100}
                                    regex={INPUT_RULES.name}
                                    placeholder="Display name"
                                    disabled={updateProfile.isPending}
                                    onEnter={handleSave}
                                />
                            ) : (
                                <>{profile.displayName}</>
                            )}

                            <div className="page-title-controls">
                                {isEditing ? (
                                    <>
                                        <button
                                            title="Save display name"
                                            onClick={handleSave}
                                            disabled={!isChanged || isInvalid || updateProfile.isPending}
                                        >
                                            ✔
                                        </button>
                                        <button
                                            title="Cancel display name edit"
                                            onClick={cancelEditing}
                                            disabled={updateProfile.isPending}
                                        >
                                            ✖
                                        </button>
                                    </>
                                ) : (
                                    <button title="Edit display name" onClick={startEditing}>
                                        ✎
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {apiError && (
                    <div style={{ color: "red" }}>
                        <div>{apiError.message}</div>
                        <div>
                            {"errorDetails" in apiError && apiError.errorDetails?.map((detail) => (
                                <div key={detail.field}>{detail.field}: {detail.message}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
