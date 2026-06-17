import {BrowserRouter, Route, Routes} from "react-router-dom";
import FilmListPage from "../../features/film/pages/FilmListPage";
import FilmPage from "../../features/film/pages/FilmPage.tsx";
import {AppLayout} from "../../layouts/AppLayout.tsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout/>}>
                    <Route path="/films" element={<FilmListPage/>}/>
                    <Route path="/films/:id" element={<FilmPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;