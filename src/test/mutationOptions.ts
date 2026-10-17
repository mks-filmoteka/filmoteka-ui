export type MutationOptions<TData = void> = {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
};
