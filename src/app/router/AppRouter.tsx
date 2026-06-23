import {BrowserRouter, Route, Routes} from "react-router-dom";
import FilmListPage from "../../features/film/pages/FilmListPage";
import FilmPage from "../../features/film/pages/FilmPage.tsx";
import {AppLayout} from "../../layouts/AppLayout.tsx";
import PersonPage from "../../features/person/pages/PersonPage.tsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout/>}>
                    <Route path="/films" element={<FilmListPage/>}/>
                    <Route path="/films/:id" element={<FilmPage/>}/>
                    <Route path="/people/actor/:id" element={<PersonPage type="actor"/>}/>
                    <Route path="/people/director/:id" element={<PersonPage type="director"/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;