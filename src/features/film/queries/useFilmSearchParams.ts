import {useSearchParams} from "react-router-dom";
import {useCallback} from "react";


export function useFilmSearchParams() {
    const [searchParams, setSearchParams] = useSearchParams();
    const updateParams = useCallback(
        (changes: Record<string, string | undefined>) => {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                Object.entries(changes).forEach(([key, value]) => {
                    if (value) {
                        params.set(key, value);
                    } else {
                        params.delete(key);
                    }
                });
                return params;
            });
        }, [setSearchParams]
    );

    const title = searchParams.get("title") ?? "";
    const p = Number(searchParams.get("page"));
    const pageParam = Number.isFinite(p) ? p : 0;
    const view = searchParams.get("view") ?? "list";

    return {
        title, pageParam, view,
        setTitle: (value: string) =>
            updateParams({
                title: value.trim() || undefined,
                page: "1",
            }),
        setPage: (value: number) => updateParams({page: String(value)}),
        setView: (value: string) => updateParams({view: value}),
    };
}