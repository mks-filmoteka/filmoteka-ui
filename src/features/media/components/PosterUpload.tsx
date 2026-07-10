import {type ChangeEvent, type DragEvent, useEffect, useRef, useState} from "react";
import {getFileUrl} from "../api/mediaApi.ts";
import Poster from "./Poster.tsx";

type Props = {
    value?: string | null;
    alt: string;
    onChange: (posterName: string | null) => void;
    posterFile: File | null;
    setPosterFile: (file: File | null) => void;
    disabled?: boolean;
};

type Preview = {
    file: File;
    url: string;
};

function PosterUpload(props: Readonly<Props>) {
    const {value, alt, onChange, posterFile, setPosterFile, disabled} = props
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

    const setPreviewFile = (file: File) => {
        revokePreview();
        const nextPreview = {
            file,
            url: URL.createObjectURL(file),
        };
        previewRef.current = nextPreview;
        setPreview(nextPreview);
    };

    const clearPreview = () => {
        revokePreview();
        setPreview(null);
    };

    const previewUrl = preview?.file === posterFile ? preview.url : null;
    const savedPosterUrl = value ? getFileUrl(value) : null;
    const posterUrl = posterFile && previewUrl ? previewUrl : savedPosterUrl;

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {return}
        setPreviewFile(file);
        setPosterFile(file);
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setDragOver(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) {return}
        setPreviewFile(file);
        setPosterFile(file);
    };

    const handleRemove = () => {
        clearPreview();
        setPosterFile(null);
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <>
            <div className="poster-upload">
                {posterUrl && (
                    <Poster src={posterUrl} alt={alt}/>
                )}
                <button
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
                        ✚
                    </div>
                </button>

                {(value || posterFile) && (
                    <button
                        className="poster-remove-button"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        🗑
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                hidden
            />
        </>
    );
}

export default PosterUpload;
