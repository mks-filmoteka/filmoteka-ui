import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FilmBasic } from "../../film/types/filmBasic";
import type { Person } from "../types/person";
import PersonPage from "./PersonPage";
import type { MutationOptions } from "../../../test/mutationOptions";
import { testFilmBasic, testPerson } from "../../../test/testData";

type SearchParamsReturn = {
    view: string;
    yearFrom?: number;
    yearTo?: number;
    minYear?: number;
    maxYear?: number;
    genres: string[];
    countries: string[];
    sortParams: { by?: string; dir?: string }[];
    setView: (view: string) => void;
    setGenres: (genres: string[]) => void;
    setYearFrom: (year?: number) => void;
    setYearTo: (year?: number) => void;
    resetYears: () => void;
    setCountries: (countries: string[]) => void;
    setSort: (sort: { by?: string; dir?: string }[]) => void;
};

type FilmBrowserMockProps = {
    films: FilmBasic[];
};

const mocks = vi.hoisted(() => ({
    confirm: vi.fn(),
    usePerson: vi.fn(),
    useDeletePerson: vi.fn(),
    deletePersonMutate: vi.fn(),
    toast: vi.fn(),
    navigate: vi.fn(),
    useFilmSearchParams: vi.fn(),
}));

vi.mock("../../../shared/utils/useConfirm.ts", () => ({
    useConfirm: () => mocks.confirm,
}));

vi.mock("../queries/usePerson.ts", () => ({
    usePerson: mocks.usePerson,
}));

vi.mock("../queries/useDeletePerson.ts", () => ({
    useDeletePerson: mocks.useDeletePerson,
}));

vi.mock("../../../shared/utils/useToast.ts", () => ({
    useToast: () => mocks.toast,
}));

vi.mock("react-router", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react-router")>()),
    useNavigate: () => mocks.navigate,
}));

vi.mock("../components/PersonEditForm.tsx", () => ({
    PersonEditForm: ({ person }: { person: Person }) => <p>edit form for {person.name}</p>,
}));

vi.mock("../../../auth/useAuth.ts", () => ({
    useAuth: () => ({ isAdmin: true }),
}));

vi.mock("../../../shared/utils/useRequiredId.ts", () => ({
    useRequiredId: () => 7,
}));

vi.mock("../../film/queries/useFilmSearchParams.ts", () => ({
    useFilmSearchParams: mocks.useFilmSearchParams,
}));

vi.mock("../../film/components/FilmBrowser.tsx", () => ({
    FilmBrowser: ({ films }: FilmBrowserMockProps) => (
        <ol>
            {films.map((film) => (
                <li key={film.id}>{film.title}</li>
            ))}
        </ol>
    ),
}));

const actor = testPerson({
    id: 7,
    birthDate: "1930-05-31",
    placeOfBirth: "San Francisco, USA",
    actingFilms: [
        testFilmBasic({ id: 1, title: "Test Film 1", releaseYear: 2000, genres: ["Drama"] }),
        testFilmBasic({ id: 2, title: "Test Film 2", releaseYear: 1995, genres: ["Action"] }),
        testFilmBasic({ id: 3, title: "Test Film 3", releaseYear: 2010, genres: ["Drama"] }),
    ],
});

const actorAndDirector: Person = {
    ...actor,
    directingFilms: [testFilmBasic({ id: 4, title: "Directed Film", releaseYear: 2005, genres: ["Drama"] })],
};

const createSearchParams = (overrides: Partial<SearchParamsReturn> = {}): SearchParamsReturn => ({
    view: "list",
    yearFrom: undefined,
    yearTo: undefined,
    minYear: undefined,
    maxYear: undefined,
    genres: [],
    countries: [],
    sortParams: [],
    setView: vi.fn(),
    setGenres: vi.fn(),
    setYearFrom: vi.fn(),
    setYearTo: vi.fn(),
    resetYears: vi.fn(),
    setCountries: vi.fn(),
    setSort: vi.fn(),
    ...overrides,
});

function givenPerson(person: Person) {
    mocks.usePerson.mockReturnValue({ data: person, isLoading: false, error: null });
}

function renderPage(path = "/people/7") {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <PersonPage />
        </MemoryRouter>,
    );
}

function filmTitles() {
    return screen.getAllByRole("listitem").map((item) => item.textContent);
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 17));
    mocks.confirm.mockResolvedValue(true);
    givenPerson(actor);
    mocks.useFilmSearchParams.mockReturnValue(createSearchParams());
    mocks.useDeletePerson.mockReturnValue({ mutate: mocks.deletePersonMutate, isPending: false, error: null });
    mocks.deletePersonMutate.mockImplementation((_id: number, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
});

describe("PersonPage", () => {
    it("shows the person's details with the calculated age", () => {
        renderPage();

        expect(screen.getByRole("heading", { name: "Test Person" })).toBeInTheDocument();
        expect(screen.getByText("Actor")).toBeInTheDocument();
        expect(screen.getByText("31 May 1930 (age 96)")).toBeInTheDocument();
        expect(screen.getByText("San Francisco, USA")).toBeInTheDocument();
    });

    it("shows the age at death for a person who has died", () => {
        givenPerson({ ...actor, deathDate: "2020-01-01" });

        renderPage();

        expect(screen.getByText("31 May 1930 (age 89, died in 2020)")).toBeInTheDocument();
        expect(screen.queryByText("Died")).not.toBeInTheDocument();
    });

    it("leaves out details that are not known", () => {
        givenPerson({ ...actor, birthDate: null, placeOfBirth: null });

        renderPage();

        expect(screen.queryByText("Born")).not.toBeInTheDocument();
        expect(screen.queryByText("Birthplace")).not.toBeInTheDocument();
    });

    it("shows a silhouette when the person has no photo", () => {
        renderPage();

        expect(screen.getByText("👤")).toBeInTheDocument();
    });

    it("shows the photo when the person has one", () => {
        givenPerson({ ...actor, photoName: "photo.jpg" });

        renderPage();

        expect(screen.getByAltText("Test Person")).toHaveAttribute(
            "src",
            "http://localhost:8081/api/v1/media/files/photo.jpg",
        );
    });

    it("hides the role switch when the person has one role", () => {
        renderPage();

        expect(screen.queryByRole("button", { name: /actor \(/ })).not.toBeInTheDocument();
        expect(filmTitles()).toEqual(["Test Film 2", "Test Film 1", "Test Film 3"]);
    });

    it("switches between acting and directing films", () => {
        givenPerson(actorAndDirector);

        renderPage();

        expect(screen.getByText("Actor, Director")).toBeInTheDocument();
        expect(filmTitles()).toEqual(["Test Film 2", "Test Film 1", "Test Film 3"]);

        fireEvent.click(screen.getByRole("button", { name: "director (1)" }));

        expect(filmTitles()).toEqual(["Directed Film"]);
        expect(screen.getByRole("button", { name: "actor (3)" })).toBeInTheDocument();
    });

    it("opens on the role given in the address", () => {
        givenPerson(actorAndDirector);

        renderPage("/people/7?role=director");

        expect(filmTitles()).toEqual(["Directed Film"]);
    });

    it("shows directing films for a person who only directed", () => {
        givenPerson({ ...actor, actingFilms: [], directingFilms: actorAndDirector.directingFilms });

        renderPage();

        expect(screen.getByText("Director")).toBeInTheDocument();
        expect(filmTitles()).toEqual(["Directed Film"]);
    });

    it("opens the edit form", () => {
        renderPage();

        fireEvent.click(screen.getByTitle("Edit"));

        expect(screen.getByText("edit form for Test Person")).toBeInTheDocument();
        expect(screen.queryByTitle("Edit")).not.toBeInTheDocument();
    });

    it("deletes the person after confirmation", async () => {
        renderPage();

        fireEvent.click(screen.getByTitle("Delete"));

        await waitFor(() => expect(mocks.deletePersonMutate).toHaveBeenCalledWith(7, expect.any(Object)));
        expect(mocks.confirm).toHaveBeenCalledWith("Confirm delete person?");
        expect(mocks.toast).toHaveBeenCalledWith("Person deleted");
        expect(mocks.navigate).toHaveBeenCalledWith("/films");
    });
    it("filters and sorts the person's films before rendering the list", () => {
        mocks.useFilmSearchParams.mockReturnValue(
            createSearchParams({
                genres: ["Drama"],
                sortParams: [{ by: "releaseYear", dir: "desc" }],
            }),
        );

        renderPage();

        expect(filmTitles()).toEqual(["Test Film 3", "Test Film 1"]);
    });
});
