import { Component, type ReactNode } from "react";
import { InvalidIdError } from "../utils/useRequiredId.ts";
import { NotFoundMessage } from "./NotFoundMessage.tsx";

type Props = {
    children: ReactNode;
};

type State = {
    error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    render() {
        const { error } = this.state;

        if (error instanceof InvalidIdError) {
            return <NotFoundMessage />;
        }
        if (error) {
            return (
                <div>
                    <h1>Something went wrong</h1>
                    <button type="button" onClick={() => globalThis.location.reload()}>
                        Reload page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
