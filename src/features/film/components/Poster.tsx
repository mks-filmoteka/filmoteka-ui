import {useState} from "react";

type Props = {
    src?: string | null;
    alt: string;
};

type ImageState = {
    src: string;
    loaded: boolean;
    error: boolean;
};

function Poster({src, alt}: Readonly<Props>) {
    const [imageState, setImageState] = useState<ImageState | null>(null);

    if (!src) {
        return (
            <div className="poster-wrapper">
                <div className="poster-placeholder">
                    🎬
                </div>
            </div>
        );
    }

    const currentImageState = imageState?.src === src ? imageState : {src, loaded: false, error: false};

    if (currentImageState.error) {
        return (
            <div className="poster-wrapper">
                <div className="poster-placeholder">
                    🎬
                </div>
            </div>
        );
    }

    return (
        <div className="poster-wrapper">
            {!currentImageState.loaded && (
                <div className="poster-placeholder">
                    🎬
                </div>
            )}
            <img
                key={src}
                src={src}
                alt={alt}
                className="poster"
                loading="lazy"
                onLoad={() => setImageState({src, loaded: true, error: false,})}
                onError={() => setImageState({src, loaded: false, error: true,})}
                style={{opacity: currentImageState.loaded ? 1 : 0}}
            />
        </div>
    );
}

export default Poster;