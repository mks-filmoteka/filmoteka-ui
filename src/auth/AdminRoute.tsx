import {Navigate, Outlet} from "react-router";
import {useAuth} from "./useAuth.ts";

export function AdminRoute() {
    const {status, authenticated, isAdmin} = useAuth();

    if (status === "checking") {
        return <h1>Checking authentication...</h1>;
    }

    if (!authenticated || !isAdmin) {
        return <Navigate to="/films" replace/>;
    }

    return <Outlet/>;
}
