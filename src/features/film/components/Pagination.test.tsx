import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {Pagination} from "./Pagination";

const getNumberButtons = () =>
    screen.getAllByRole("button")
        .filter(button => /^\d+$/.test(button.textContent ?? ""));

describe("Pagination", () => {
    it("renders nothing when there is only one page", () => {
        const {container} = render(
            <Pagination page={1} totalPages={1} setPage={vi.fn()} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("disables previous navigation on the first page and next navigation on the last page", () => {
        const {rerender} = render(
            <Pagination page={1} totalPages={3} setPage={vi.fn()} />
        );

        let buttons = screen.getAllByRole("button");
        expect(buttons[1]).toBeDisabled();
        expect(buttons[5]).not.toBeDisabled();

        rerender(<Pagination page={3} totalPages={3} setPage={vi.fn()} />);

        buttons = screen.getAllByRole("button");
        expect(buttons[1]).not.toBeDisabled();
        expect(buttons[5]).toBeDisabled();
    });

    it("renders a centered window of up to seven pages", () => {
        render(<Pagination page={10} totalPages={20} setPage={vi.fn()} />);

        expect(getNumberButtons().map(button => button.textContent)).toEqual([
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
        ]);
    });

    it("clamps first, previous, next, and last page changes", () => {
        const setPage = vi.fn();

        const {rerender} = render(<Pagination page={1} totalPages={3} setPage={setPage} />);

        let buttons = screen.getAllByRole("button");
        fireEvent.click(screen.getByTitle("First page"));
        fireEvent.click(screen.getByText("3"));
        fireEvent.click(buttons[5]);
        fireEvent.click(screen.getByTitle("Last page: 3"));

        rerender(<Pagination page={2} totalPages={3} setPage={setPage} />);
        buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[1]);

        expect(setPage).toHaveBeenNthCalledWith(1, 1);
        expect(setPage).toHaveBeenNthCalledWith(2, 3);
        expect(setPage).toHaveBeenNthCalledWith(3, 2);
        expect(setPage).toHaveBeenNthCalledWith(4, 3);
        expect(setPage).toHaveBeenNthCalledWith(5, 1);
        expect(setPage).toHaveBeenCalledTimes(5);
    });
});
