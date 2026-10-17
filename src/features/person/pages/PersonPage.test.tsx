import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FilmBasic } from "../../film/types/filmBasic";
import type { Person } from "../types/person";
import PersonPage from "./PersonPage";

type MutationOptions = {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
};

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
    useUpdatePerson: vi.fn(),
    updatePersonMutate: vi.fn(),
    useFilmSearchParams: vi.fn(),
}));

vi.mock("../../../shared/utils/useConfirm.ts", () => ({
    useConfirm: () => mocks.confirm,
}));

vi.mock("../queries/usePerson.ts", () => ({
    usePerson: mocks.usePerson,
}));

vi.mock("../queries/useUpdatePerson.ts", () => ({
    useUpdatePerson: mocks.useUpdatePerson,
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

const film = (id: number, title: string, releaseYear: number, genres: string[]): FilmBasic => ({
    id,
    title,
    releaseYear,
    countries: ["Poland"],
    posterName: null,
    genres,
});

const actor: Person = {
    id: 7,
    name: "Test Person",
    birthDate: "1930-05-31",
    deathDate: null,
    placeOfBirth: "San Francisco, USA",
    photoName: null,
    actingFilms: [
        film(1, "Test Film 1", 2000, ["Drama"]),
        film(2, "Test Film 2", 1995, ["Action"]),
        film(3, "Test Film 3", 2010, ["Drama"]),
    ],
    directingFilms: [],
};

const actorAndDirector: Person = {
    ...actor,
    directingFilms: [film(4, "Directed Film", 2005, ["Drama"])],
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
    mocks.useUpdatePerson.mockReturnValue({
        mutate: mocks.updatePersonMutate,
        isPending: false,
    });
    mocks.useFilmSearchParams.mockReturnValue(createSearchParams());
    mocks.updatePersonMutate.mockImplementation((_variables: unknown, options?: MutationOptions) => {
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

    it("keeps the other details when only the name is edited", async () => {
        givenPerson({ ...actor, photoName: "photo.jpg" });
        renderPage();

        fireEvent.click(screen.getByTitle("Edit"));
        fireEvent.change(screen.getByLabelText("edit name"), {
            target: { value: "  Updated Test Person  " },
        });
        fireEvent.click(screen.getByTitle("Save"));
        await waitFor(() => expect(mocks.updatePersonMutate).toHaveBeenCalled());

        expect(mocks.updatePersonMutate).toHaveBeenCalledWith(
            {
                id: 7,
                request: {
                    name: "Updated Test Person",
                    birthDate: "1930-05-31",
                    deathDate: null,
                    placeOfBirth: "San Francisco, USA",
                    photoName: "photo.jpg",
                },
            },
            expect.any(Object),
        );
    });

    it("keeps edit mode open and shows the API error when update fails", async () => {
        const error = Object.assign(new Error("Update failed"), {
            response: {
                data: {
                    message: "Name already exists",
                    errorDetails: [{ field: "name", message: "Must be unique" }],
                },
            },
        });
        mocks.updatePersonMutate.mockImplementation((_variables: unknown, options?: MutationOptions) => {
            options?.onError?.(error);
        });
        renderPage();

        fireEvent.click(screen.getByTitle("Edit"));
        fireEvent.change(screen.getByLabelText("edit name"), {
            target: { value: "Duplicate Test Person" },
        });
        fireEvent.click(screen.getByTitle("Save"));

        await waitFor(() => {
            expect(screen.getByText("Name already exists")).toBeInTheDocument();
        });
        expect(screen.getByLabelText("edit name")).toBeInTheDocument();
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
