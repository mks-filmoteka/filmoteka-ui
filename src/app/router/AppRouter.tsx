import {BrowserRouter, Route, Routes, Navigate} from "react-router";
import FilmPage from "../../features/film/pages/FilmPage.tsx";
import {AppLayout} from "../../layouts/AppLayout.tsx";
import PersonPage from "../../features/person/pages/PersonPage.tsx";
import CollectionPage from "../../features/collection/pages/CollectionPage.tsx";
import AllFilmsPage from "../../features/film/pages/AllFilmsPage.tsx";
import CreateFilmPage from "../../features/film/pages/CreateFilmPage.tsx";
import EditFilmPage from "../../features/film/pages/EditFilmPage.tsx";
import {AdminRoute} from "../../auth/AdminRoute.tsx";
import {AuthRoute} from "../../auth/AuthRoute.tsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout/>}>
                    <Route path="/" element={<Navigate to="/films" replace />} />

                    <Route path="/films" element={<AllFilmsPage/>}/>
                    <Route path="/films/:id" element={<FilmPage/>}/>
                    <Route path="/people/actor/:id" element={<PersonPage type="actor"/>}/>
                    <Route path="/people/director/:id" element={<PersonPage type="director"/>}/>

                    <Route element={<AuthRoute/>}>
                        <Route path="/collections/:id" element={<CollectionPage/>}/>
                    </Route>

                    <Route element={<AdminRoute/>}>
                        <Route path="/films/new" element={<CreateFilmPage/>}/>
                        <Route path="/films/:id/edit" element={<EditFilmPage/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
