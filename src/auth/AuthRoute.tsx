import {Navigate, Outlet} from "react-router";
import {useAuth} from "./useAuth.ts";

export function AuthRoute() {
    const {authenticated} = useAuth();

    if (!authenticated) {
        return <Navigate to="/films" replace/>;
    }

    return <Outlet/>;
}
