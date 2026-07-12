import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import type {ReactElement} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {FilmBasic} from "../../film/types/filmBasic";
import type {Person} from "../types/person";
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
    sortParams: {by?: string; dir?: string}[];
    setView: (view: string) => void;
    setGenres: (genres: string[]) => void;
    setYearFrom: (year?: number) => void;
    setYearTo: (year?: number) => void;
    resetYears: () => void;
    setCountries: (countries: string[]) => void;
    setSort: (sort: {by?: string; dir?: string}[]) => void;
};

type FilmListMockProps = {
    films: FilmBasic[];
    pageTitle: ReactElement;
};

const mocks = vi.hoisted(() => ({
    usePersonQuery: vi.fn(),
    updatePersonMutate: vi.fn(),
    useFilmSearchParams: vi.fn(),
}));

vi.mock("../queries/usePersonQuery.ts", () => ({
    usePersonQuery: mocks.usePersonQuery,
}));

vi.mock("../queries/useUpdatePerson.ts", () => ({
    useUpdatePerson: () => ({
        mutate: mocks.updatePersonMutate,
        isPending: false,
    }),
}));

vi.mock("../../../shared/auth/useAuth.ts", () => ({
    useIsAdmin: () => true,
}));

vi.mock("../../../shared/queries/useRequiredParam.ts", () => ({
    useRequiredParam: () => "7",
}));

vi.mock("../../film/queries/useFilmSearchParams.ts", () => ({
    useFilmSearchParams: mocks.useFilmSearchParams,
}));

vi.mock("../../film/components/FilmList.tsx", () => ({
    FilmList: ({films, pageTitle}: FilmListMockProps) => (
        <div>
            {pageTitle}
            <ol>
                {films.map(film => (
                    <li key={film.id}>{film.title}</li>
                ))}
            </ol>
        </div>
    ),
}));

const person: Person = {
    id: 7,
    name: "Test Person",
    films: [
        {
            id: 1,
            title: "Test Film 1",
            releaseYear: 2000,
            countries: ["Poland"],
            posterName: null,
            genres: ["Drama"],
        },
        {
            id: 2,
            title: "Test Film 2",
            releaseYear: 1995,
            countries: ["Poland"],
            posterName: null,
            genres: ["Action"],
        },
        {
            id: 3,
            title: "Test Film 3",
            releaseYear: 2010,
            countries: ["France"],
            posterName: null,
            genres: ["Drama"],
        },
    ],
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

function getSaveButton(container: HTMLElement) {
    const button = container.querySelector<HTMLButtonElement>(".page-title-controls button");
    if (!button) {
        throw new Error("Save button not found");
    }

    return button;
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));

    mocks.usePersonQuery.mockReturnValue({
        data: person,
        isLoading: false,
        error: null,
    });
    mocks.useFilmSearchParams.mockReturnValue(createSearchParams());
    mocks.updatePersonMutate.mockImplementation(
        (_variables: unknown, options?: MutationOptions) => {
            options?.onSuccess?.();
        }
    );
});

describe("PersonPage", () => {
    it("trims the edited name before updating the person", () => {
        const {container} = render(<PersonPage type="actor" />);

        fireEvent.click(screen.getByTitle("Edit"));
        fireEvent.change(screen.getByLabelText("edit name"), {
            target: {value: "  Updated Test Person  "},
        });
        fireEvent.click(getSaveButton(container));

        expect(mocks.updatePersonMutate).toHaveBeenCalledWith(
            {
                id: "7",
                request: {name: "Updated Test Person"},
            },
            expect.any(Object)
        );
    });

    it("keeps edit mode open and shows the API error when update fails", async () => {
        const error = Object.assign(new Error("Update failed"), {
            response: {
                data: {
                    message: "Name already exists",
                    errorDetails: [{field: "name", message: "Must be unique"}],
                },
            },
        });
        mocks.updatePersonMutate.mockImplementation(
            (_variables: unknown, options?: MutationOptions) => {
                options?.onError?.(error);
            }
        );
        const {container} = render(<PersonPage type="director" />);

        fireEvent.click(screen.getByTitle("Edit"));
        fireEvent.change(screen.getByLabelText("edit name"), {
            target: {value: "Duplicate Test Person"},
        });
        fireEvent.click(getSaveButton(container));

        await waitFor(() => {
            expect(screen.getByText("Name already exists")).toBeInTheDocument();
        });
        expect(screen.getByLabelText("edit name")).toBeInTheDocument();
    });

    it("filters and sorts the person's films before rendering the list", () => {
        mocks.useFilmSearchParams.mockReturnValue(createSearchParams({
            genres: ["Drama"],
            sortParams: [{by: "releaseYear", dir: "desc"}],
        }));

        render(<PersonPage type="actor" />);

        expect(screen.getAllByRole("listitem").map(item => item.textContent)).toEqual([
            "Test Film 3",
            "Test Film 1",
        ]);
        expect(screen.queryByText("Test Film 2")).not.toBeInTheDocument();
    });
});
