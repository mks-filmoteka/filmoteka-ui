import {Navigate, Outlet} from "react-router";
import {useAuth} from "./useAuth.ts";

export function AdminRoute() {
    const {authenticated, isAdmin} = useAuth();

    if (!authenticated || !isAdmin) {
        return <Navigate to="/films" replace/>;
    }

    return <Outlet/>;
}
