import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
export default function PrivateRoute({ children }) {
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );
    const tiendaActiva = useAuthStore(
        (state) => state.tiendaActiva
    );
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }
    /*
        Evita entrar al sistema
        si aún no eligió tienda
    */
    if (!tiendaActiva) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }
    return children;
}