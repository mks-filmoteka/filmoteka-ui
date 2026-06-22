import {useParams} from "react-router-dom";
import {usePersonQuery} from "../queries/usePersonQuery.ts";

function PersonPage() {
    const {type, id} = useParams();
    const isValidType = type === "actor" || type === "director";
    const {data, isLoading, error} = usePersonQuery(isValidType ? type : undefined, id);

    if (!data) return <h1>{type} not found</h1>;
    if (isLoading) return <h1>Loading...</h1>;

    if (error) {
        return (
            <div>
                <h1>
                    Error loading {type}
                </h1>
                {error.message}
            </div>
        );
    }

    return (
        <div>
            {/* Name */}
            <div className="page-title">
                <h1>{data?.name}</h1>
                {type}
            </div>
            <hr/>
            <ul>
                {data.films?.map((f) => (
                    <li key={f.id}>{f.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default PersonPage;