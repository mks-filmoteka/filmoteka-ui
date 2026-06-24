

export function useAuth() {
    //TODO implement auth
    return {user: {role: "ADMIN" as "ADMIN" | "USER"}};
}

export function useIsAdmin() {
    const { user } = useAuth();
    return user.role === "ADMIN";
}