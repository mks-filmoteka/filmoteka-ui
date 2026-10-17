import { useState } from "react";
import { Icon, type IconName } from "../../../shared/components/Icon.tsx";

type Props = {
    src?: string | null;
    alt: string;
    placeholderIcon?: IconName;
};

type ImageState = {
    src: string;
    loaded: boolean;
    error: boolean;
};

function Poster({ src, alt, placeholderIcon = "film" }: Readonly<Props>) {
    const [imageState, setImageState] = useState<ImageState | null>(null);

    if (!src) {
        return (
            <div className="poster-wrapper">
                <div className="poster-placeholder">
                    <Icon name={placeholderIcon} />
                </div>
            </div>
        );
    }

    const currentImageState = imageState?.src === src ? imageState : { src, loaded: false, error: false };

    if (currentImageState.error) {
        return (
            <div className="poster-wrapper">
                <div className="poster-placeholder">
                    <Icon name={placeholderIcon} />
                </div>
            </div>
        );
    }

    return (
        <div className="poster-wrapper">
            {!currentImageState.loaded && (
                <div className="poster-placeholder">
                    <Icon name={placeholderIcon} />
                </div>
            )}
            <img
                key={src}
                src={src}
                alt={alt}
                className="poster"
                loading="lazy"
                onLoad={() => setImageState({ src, loaded: true, error: false })}
                onError={() => setImageState({ src, loaded: false, error: true })}
                style={{ opacity: currentImageState.loaded ? 1 : 0 }}
            />
        </div>
    );
}

export default Poster;
