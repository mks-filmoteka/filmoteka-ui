import { useParams } from "react-router-dom";

function FilmPage() {
    const { id } = useParams();
    return (
        <div>
            <h1>Film Details: {id}</h1>
        </div>
    );
}

export default FilmPage;