import {Navigate, Outlet} from "react-router";
import {useAuth} from "./useAuth.ts";

export function AuthRoute() {
    const {status, authenticated} = useAuth();

    if (status === "checking") {
        return <h1>Checking authentication...</h1>;
    }

    if (!authenticated) {
        return <Navigate to="/films" replace/>;
    }

    return <Outlet/>;
}
