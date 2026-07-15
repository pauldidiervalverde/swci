import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function PublicRoute({ children }) {

    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    const tiendaActiva = useAuthStore(
        (state) => state.tiendaActiva
    );

    if (
        isAuthenticated &&
        tiendaActiva
    ) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}