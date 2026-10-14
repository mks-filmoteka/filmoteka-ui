import { Link } from "react-router";

export function NotFoundMessage() {
    return (
        <div>
            <h1>Page not found</h1>
            <p>
                <Link to="/films">Back to films</Link>
            </p>
        </div>
    );
}
