import { BrowserRouter, Routes, Route } from "react-router-dom";
import FilmListPage from "../../features/film/pages/FilmListPage";
import FilmPage from "../../features/film/pages/FilmPage.tsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/films" element={<FilmListPage />} />
                <Route path="/films/:id" element={<FilmPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;