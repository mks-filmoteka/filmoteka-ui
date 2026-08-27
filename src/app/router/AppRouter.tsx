import {BrowserRouter, Route, Routes, Navigate} from "react-router";
import FilmPage from "../../features/film/pages/FilmPage.tsx";
import {AppLayout} from "../../layouts/AppLayout.tsx";
import PersonPage from "../../features/person/pages/PersonPage.tsx";
import CollectionPage from "../../features/collection/pages/CollectionPage.tsx";
import AllFilmsPage from "../../features/film/pages/AllFilmsPage.tsx";

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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
