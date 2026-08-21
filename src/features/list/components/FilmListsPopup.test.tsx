import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {FilmListsPopup} from "./FilmListsPopup.tsx";

type MutationOptions = {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
};

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    onClose: vi.fn(),
    useFilmLists: vi.fn(),
    createFilmList: {
        mutate: vi.fn(),
        isPending: false
    },
    updateFilmList: {
        mutate: vi.fn(),
        isPending: false
    },
    deleteFilmList: {
        mutate: vi.fn(),
        isPending: false
    },
    filmListsQuery: {
        data: [
            {id: "7", name: "Favorites", filmIds: [1, 2]},
            {id: "9", name: "Watch later", filmIds: [3]}
        ],
        isLoading: false,
        error: null as Error | null
    }
}));

vi.mock("../queries/useFilmLists.ts", () => ({
    useFilmLists: mocks.useFilmLists
}));

vi.mock("../queries/useCreateFilmList.ts", () => ({
    useCreateFilmList: () => mocks.createFilmList
}));

vi.mock("../queries/useUpdateFilmList.ts", () => ({
    useUpdateFilmList: () => mocks.updateFilmList
}));

vi.mock("../queries/useDeleteFilmList.ts", () => ({
    useDeleteFilmList: () => mocks.deleteFilmList
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual<typeof import("react-router")>("react-router");
    return {
        ...actual,
        useNavigate: () => mocks.navigate
    };
});

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));
    mocks.filmListsQuery = {
        data: [
            {id: "7", name: "Favorites", filmIds: [1, 2]},
            {id: "9", name: "Watch later", filmIds: [3]}
        ],
        isLoading: false,
        error: null
    };
    mocks.useFilmLists.mockImplementation(() => mocks.filmListsQuery);
    mocks.createFilmList.isPending = false;
    mocks.updateFilmList.isPending = false;
    mocks.deleteFilmList.isPending = false;
    mocks.createFilmList.mutate.mockImplementation((_variables, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
    mocks.updateFilmList.mutate.mockImplementation((_variables, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
    mocks.deleteFilmList.mutate.mockImplementation((_variables, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
});

describe("FilmListsPopup", () => {
    it("renders the title, film lists, and row action buttons", () => {
        render(<FilmListsPopup onClose={mocks.onClose}/>);

        expect(screen.getByText("Custom lists")).toBeInTheDocument();
        expect(screen.getByTitle("Create new list")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /Favorites/})).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /Watch later/})).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getAllByTitle("rename")).toHaveLength(2);
        expect(screen.getAllByTitle("delete")).toHaveLength(2);
    });

    it("closes from the backdrop button", () => {
        render(<FilmListsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getByLabelText("Close film lists"));

        expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it("navigates to a film list and closes the popup", () => {
        render(<FilmListsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getByRole("button", {name: /Favorites/}));

        expect(mocks.onClose).toHaveBeenCalledTimes(1);
        expect(mocks.navigate).toHaveBeenCalledWith("/film-lists/7");
    });

    it("shows loading and error states", () => {
        mocks.filmListsQuery = {
            data: [],
            isLoading: true,
            error: null
        };
        const {rerender} = render(<FilmListsPopup onClose={mocks.onClose}/>);

        expect(screen.getByRole("heading", {name: "Loading..."})).toBeInTheDocument();

        mocks.filmListsQuery = {
            data: [],
            isLoading: false,
            error: new Error("Request failed")
        };
        rerender(<FilmListsPopup onClose={mocks.onClose}/>);

        expect(screen.getByRole("heading", {name: "Error loading film lists: Request failed"})).toBeInTheDocument();
    });

    it("creates a film list from the inline input", () => {
        render(<FilmListsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getByTitle("Create new list"));
        fireEvent.change(screen.getByLabelText("film list name"), {
            target: {value: "  Weekend films 2026  "}
        });
        fireEvent.click(screen.getByTitle("Save"));

        expect(mocks.createFilmList.mutate).toHaveBeenCalledWith(
            {request: {name: "Weekend films 2026"}},
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function)
            })
        );
        expect(screen.queryByLabelText("film list name")).not.toBeInTheDocument();
    });

    it("updates a film list name from the inline edit input", () => {
        render(<FilmListsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getAllByTitle("rename")[0]);
        fireEvent.change(screen.getByLabelText("edit film list Favorites"), {
            target: {value: "  Updated Favorites  "}
        });
        fireEvent.click(screen.getByTitle("Save"));

        expect(mocks.updateFilmList.mutate).toHaveBeenCalledWith(
            {id: "7", request: {name: "Updated Favorites"}},
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function)
            })
        );
        expect(screen.queryByLabelText("edit film list Favorites")).not.toBeInTheDocument();
    });

    it("deletes a film list after confirmation", () => {
        render(<FilmListsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getAllByTitle("delete")[1]);

        expect(globalThis.confirm).toHaveBeenCalledWith("Confirm delete film list?");
        expect(mocks.deleteFilmList.mutate).toHaveBeenCalledWith(
            "9",
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function)
            })
        );
    });
});
