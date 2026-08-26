import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {CollectionsPopup} from "./CollectionsPopup.tsx";

type MutationOptions = {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
};

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    useNavigate: vi.fn(),
    onClose: vi.fn(),
    useCollections: vi.fn(),
    useCreateCollection: vi.fn(),
    createCollectionMutate: vi.fn(),
    createCollectionIsPending: false,
    useUpdateCollection: vi.fn(),
    updateCollectionMutate: vi.fn(),
    updateCollectionIsPending: false,
    useDeleteCollection: vi.fn(),
    deleteCollectionMutate: vi.fn(),
    deleteCollectionIsPending: false,
    useAddFilm: vi.fn(),
    addFilmMutate: vi.fn(),
    addFilmIsPending: false,
    useRemoveFilm: vi.fn(),
    removeFilmMutate: vi.fn(),
    removeFilmIsPending: false,
    collectionsQuery: {
        data: [
            {id: 7, name: "Favorites", filmIds: [1, 2]},
            {id: 9, name: "Watch later", filmIds: [3]}
        ],
        isLoading: false,
        error: null as Error | null
    }
}));

vi.mock("../queries/useCollections.ts", () => ({
    useCollections: mocks.useCollections
}));

vi.mock("../queries/useCreateCollection.ts", () => ({
    useCreateCollection: mocks.useCreateCollection
}));

vi.mock("../queries/useUpdateCollection.ts", () => ({
    useUpdateCollection: mocks.useUpdateCollection
}));

vi.mock("../queries/useDeleteCollection.ts", () => ({
    useDeleteCollection: mocks.useDeleteCollection
}));

vi.mock("../queries/useAddFilm.ts", () => ({
    useAddFilm: mocks.useAddFilm
}));

vi.mock("../queries/useRemoveFilm.ts", () => ({
    useRemoveFilm: mocks.useRemoveFilm
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual<typeof import("react-router")>("react-router");
    return {
        ...actual,
        useNavigate: mocks.useNavigate
    };
});

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));
    mocks.collectionsQuery = {
        data: [
            {id: 7, name: "Favorites", filmIds: [1, 2]},
            {id: 9, name: "Watch later", filmIds: [3]}
        ],
        isLoading: false,
        error: null
    };
    mocks.useNavigate.mockReturnValue(mocks.navigate);
    mocks.useCollections.mockImplementation(() => mocks.collectionsQuery);
    mocks.createCollectionIsPending = false;
    mocks.updateCollectionIsPending = false;
    mocks.deleteCollectionIsPending = false;
    mocks.addFilmIsPending = false;
    mocks.removeFilmIsPending = false;
    mocks.useCreateCollection.mockImplementation(() => ({
        mutate: mocks.createCollectionMutate,
        isPending: mocks.createCollectionIsPending
    }));
    mocks.useUpdateCollection.mockImplementation(() => ({
        mutate: mocks.updateCollectionMutate,
        isPending: mocks.updateCollectionIsPending
    }));
    mocks.useDeleteCollection.mockImplementation(() => ({
        mutate: mocks.deleteCollectionMutate,
        isPending: mocks.deleteCollectionIsPending
    }));
    mocks.useAddFilm.mockImplementation(() => ({
        mutate: mocks.addFilmMutate,
        isPending: mocks.addFilmIsPending
    }));
    mocks.useRemoveFilm.mockImplementation(() => ({
        mutate: mocks.removeFilmMutate,
        isPending: mocks.removeFilmIsPending
    }));
    mocks.createCollectionMutate.mockImplementation((_variables, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
    mocks.updateCollectionMutate.mockImplementation((_variables, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
    mocks.deleteCollectionMutate.mockImplementation((_variables, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
    mocks.addFilmMutate.mockImplementation((_variables, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
    mocks.removeFilmMutate.mockImplementation((_variables, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
});

describe("CollectionsPopup", () => {
    it("renders the title, collections, and row action buttons", () => {
        render(<CollectionsPopup onClose={mocks.onClose}/>);

        expect(screen.getByText("Collections")).toBeInTheDocument();
        expect(screen.getByTitle("Create new collection")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /Favorites/})).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /Watch later/})).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getAllByTitle("rename")).toHaveLength(2);
        expect(screen.getAllByTitle("delete")).toHaveLength(2);
    });

    it("closes from the backdrop button", () => {
        render(<CollectionsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getByLabelText("Close collections"));

        expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it("navigates to a collection and closes the popup", () => {
        render(<CollectionsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getByRole("button", {name: /Favorites/}));

        expect(mocks.onClose).toHaveBeenCalledTimes(1);
        expect(mocks.navigate).toHaveBeenCalledWith("/collections/7");
    });

    it("shows loading and error states", () => {
        mocks.collectionsQuery = {
            data: [],
            isLoading: true,
            error: null
        };
        const {rerender} = render(<CollectionsPopup onClose={mocks.onClose}/>);

        expect(screen.getByRole("heading", {name: "Loading..."})).toBeInTheDocument();

        mocks.collectionsQuery = {
            data: [],
            isLoading: false,
            error: new Error("Request failed")
        };
        rerender(<CollectionsPopup onClose={mocks.onClose}/>);

        expect(screen.getByRole("heading", {name: "Error loading collections: Request failed"})).toBeInTheDocument();
    });

    it("creates a collection from the inline input", () => {
        render(<CollectionsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getByTitle("Create new collection"));
        fireEvent.change(screen.getByLabelText("collection name"), {
            target: {value: "  Weekend films 2026  "}
        });
        fireEvent.click(screen.getByTitle("Save"));

        expect(mocks.createCollectionMutate).toHaveBeenCalledWith(
            {request: {name: "Weekend films 2026"}},
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function)
            })
        );
        expect(screen.queryByLabelText("collection name")).not.toBeInTheDocument();
    });

    it("updates a collection name from the inline edit input", () => {
        render(<CollectionsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getAllByTitle("rename")[0]);
        fireEvent.change(screen.getByLabelText("edit collection Favorites"), {
            target: {value: "  Updated Favorites  "}
        });
        fireEvent.click(screen.getByTitle("Save"));

        expect(mocks.updateCollectionMutate).toHaveBeenCalledWith(
            {id: 7, request: {name: "Updated Favorites"}},
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function)
            })
        );
        expect(screen.queryByLabelText("edit collection Favorites")).not.toBeInTheDocument();
    });

    it("deletes a collection after confirmation", () => {
        render(<CollectionsPopup onClose={mocks.onClose}/>);

        fireEvent.click(screen.getAllByTitle("delete")[1]);

        expect(globalThis.confirm).toHaveBeenCalledWith("Confirm delete collection?");
        expect(mocks.deleteCollectionMutate).toHaveBeenCalledWith(
            9,
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function)
            })
        );
    });

    it("replaces collection edit actions with film add and remove actions", () => {
        render(<CollectionsPopup onClose={mocks.onClose} filmId={2}/>);

        const addButtons = screen.getAllByTitle("add film");
        const removeButtons = screen.getAllByTitle("remove film");

        expect(screen.queryByTitle("Create new collection")).not.toBeInTheDocument();
        expect(screen.queryByTitle("rename")).not.toBeInTheDocument();
        expect(screen.queryByTitle("delete")).not.toBeInTheDocument();
        expect(addButtons[0]).toBeDisabled();
        expect(addButtons[1]).toBeEnabled();
        expect(removeButtons[0]).toBeEnabled();
        expect(removeButtons[1]).toBeDisabled();

        fireEvent.click(addButtons[1]);
        fireEvent.click(removeButtons[0]);

        expect(mocks.addFilmMutate).toHaveBeenCalledWith(
            {collectionId: 9, filmId: 2},
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function)
            })
        );
        expect(mocks.removeFilmMutate).toHaveBeenCalledWith(
            {collectionId: 7, filmId: 2},
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function)
            })
        );
    });
});
