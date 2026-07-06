import {type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState} from "react";
import {getFileUrl} from "../api/mediaApi.ts";
import Poster from "./Poster.tsx";

type Props = {
    value?: string | null;
    alt: string;
    onChange: (posterName: string | null) => void;
    posterFile: File | null;
    setPosterFile: (file: File | null) => void;
};

function PosterUpload(props: Readonly<Props>) {
    const {value, alt, onChange, posterFile, setPosterFile} = props
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const previewUrl = useMemo(() => {
        if (!posterFile) {
            return null;
        }
        return URL.createObjectURL(posterFile);
    }, [posterFile]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const posterUrl = previewUrl ?? (value ? getFileUrl(value) : null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {return}
        setPosterFile(file);
        event.target.value = "";
    };

    const handleDrop = async (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setDragOver(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) {return}
        setPosterFile(file);
    };

    const handleRemove = () => {
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

            >
                <div className="poster-placeholder">
                    ✚
                </div>
            </button>
            </div>

            {value && (
                <button onClick={handleRemove}>
                    🗑
                </button>
            )}

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