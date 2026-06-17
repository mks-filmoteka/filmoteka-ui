import {useState} from "react";

type Props = {
    src?: string;
    alt: string;
};

function Poster({src, alt}: Props) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);


    if (!loaded || !src || error) {
        return (
            <div className="poster-placeholder">
                🎬
            </div>
        );
    }

    return (
        <div>
            {(!loaded || error || !src) && (
                <div className="poster-placeholder">
                    🎬
                </div>
            )}
            {src && !error && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className="poster"
                />
            )}
        </div>
    );
}

export default Poster;