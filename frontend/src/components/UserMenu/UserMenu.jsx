import "./UserMenu.css";

import { useNavigate } from "react-router-dom";

import {
    Ambulance,
    User,

    LogOut,
} from "lucide-react";

import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";

function UserMenu() {

    const navigate = useNavigate();

    const usuario = useAuthStore(
        (state) => state.usuario
    );

    const logout = useAuthStore(
        (state) => state.logout
    );

    const closeUserMenu = useUIStore(
        (state) => state.closeUserMenu
    );

    const handleLogout = () => {

        closeUserMenu();

        logout();

        navigate("/login");

    };

    return (
        <div className="user-menu">

            <div className="user-menu__header">

                <strong>
                    {usuario?.nombre}
                </strong>

            </div>

            <button
                className="user-menu__item"
                onClick={() => {

                    closeUserMenu();

                    navigate("/perfil");

                }}
            >

                <User size={18} />

                <span>
                    Perfil
                </span>

            </button>

            <button
                className="user-menu__item"
                onClick={() => {

                    closeUserMenu();

                    navigate("/help");

                }}
            >

                <Ambulance size={18} />

                <span>
                    Ayuda...
                </span>

            </button>

            <button
                className="user-menu__item user-menu__item--danger"
                onClick={handleLogout}
            >

                <LogOut size={18} />

                <span>
                    Salir
                </span>

            </button>

        </div>
    );
}

export default UserMenu;