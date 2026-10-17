import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import { getFileUrl } from "../api/mediaApi.ts";
import Poster from "./Poster.tsx";
import { Icon } from "../../../shared/components/Icon.tsx";
import { IconButton } from "../../../shared/components/IconButton.tsx";

type Props = {
    value?: string | null;
    alt: string;
    onChange: (fileName: string | null) => void;
    file: File | null;
    setFile: (file: File | null) => void;
    removeLabel: string;
    disabled?: boolean;
};

type Preview = {
    file: File;
    url: string;
};

function ImageUpload(props: Readonly<Props>) {
    const { value, alt, onChange, file, setFile, removeLabel, disabled } = props;
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState<Preview | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewRef = useRef<Preview | null>(null);

    useEffect(() => {
        return () => {
            if (previewRef.current) {
                URL.revokeObjectURL(previewRef.current.url);
                previewRef.current = null;
            }
        };
    }, []);

    const revokePreview = () => {
        if (!previewRef.current) {
            return;
        }

        URL.revokeObjectURL(previewRef.current.url);
        previewRef.current = null;
    };

    const setPreviewFile = (previewFile: File) => {
        revokePreview();
        const nextPreview = {
            file: previewFile,
            url: URL.createObjectURL(previewFile),
        };
        previewRef.current = nextPreview;
        setPreview(nextPreview);
    };

    const clearPreview = () => {
        revokePreview();
        setPreview(null);
    };

    const previewUrl = preview?.file === file ? preview.url : null;
    const savedUrl = value ? getFileUrl(value) : null;
    const imageUrl = file && previewUrl ? previewUrl : savedUrl;

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newFile = event.target.files?.[0];
        if (!newFile) {
            return;
        }
        setPreviewFile(newFile);
        setFile(newFile);
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setDragOver(false);
        const newFile = event.dataTransfer.files?.[0];
        if (!newFile) {
            return;
        }
        setPreviewFile(newFile);
        setFile(newFile);
    };

    const handleRemove = () => {
        clearPreview();
        setFile(null);
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <>
            <div className="poster-upload">
                {imageUrl && <Poster src={imageUrl} alt={alt} />}
                <button
                    type="button"
                    className={`poster-wrapper poster-upload-button ${dragOver ? "poster-upload-button-drag-over" : ""}`}
                    onClick={() => inputRef.current?.click()}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        setDragOver(true);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    disabled={disabled}
                >
                    <div className="poster-placeholder">
                        <Icon name="create" />
                    </div>
                </button>

                {(value || file) && (
                    <IconButton
                        icon="delete"
                        label={removeLabel}
                        className="poster-remove-button"
                        onClick={handleRemove}
                        disabled={disabled}
                    />
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={"image/jpeg,image/png,image/webp"}
                onChange={handleFileChange}
                hidden
            />
        </>
    );
}

export default ImageUpload;
