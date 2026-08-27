import {BrowserRouter, Route, Routes, Navigate} from "react-router";
import FilmPage from "../../features/film/pages/FilmPage.tsx";
import {AppLayout} from "../../layouts/AppLayout.tsx";
import PersonPage from "../../features/person/pages/PersonPage.tsx";
import CollectionPage from "../../features/collection/pages/CollectionPage.tsx";
import AllFilmsPage from "../../features/film/pages/AllFilmsPage.tsx";
import FilmFormPage from "../../features/film/pages/FilmFormPage.tsx";
import {AdminRoute} from "../../auth/AdminRoute.tsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout/>}>
                    <Route path="/" element={<Navigate to="/films" replace />} />

                    <Route path="/films" element={<AllFilmsPage/>}/>
                    <Route path="/films/:id" element={<FilmPage/>}/>
                    <Route path="/collections/:id" element={<CollectionPage/>}/>
                    <Route path="/people/actor/:id" element={<PersonPage type="actor"/>}/>
                    <Route path="/people/director/:id" element={<PersonPage type="director"/>}/>

                    <Route element={<AdminRoute/>}>
                        <Route path="/films/new" element={<FilmFormPage mode="create"/>}/>
                        <Route path="/films/:id/edit" element={<FilmFormPage mode="edit"/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
