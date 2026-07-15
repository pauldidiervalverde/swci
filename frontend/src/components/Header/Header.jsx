import { useEffect, useRef } from "react";
import "./Header.css";

import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";

import UserMenu from "../UserMenu/UserMenu";

import { Menu, User } from "lucide-react";

function Header() {
    const usuario = useAuthStore(
        (state) => state.usuario
    );

    const tiendaActiva = useAuthStore(
        (state) => state.tiendaActiva
    );

    const toggleSidebar = useUIStore(
        (state) => state.toggleSidebar
    );

    const userMenuOpen = useUIStore(
        (state) => state.userMenuOpen
    );

    const toggleUserMenu = useUIStore(
        (state) => state.toggleUserMenu
    );

    const closeUserMenu = useUIStore(
        (state) => state.closeUserMenu
    );

    const wrapperRef = useRef(null);

    const fecha = new Date().toLocaleDateString(
        "es-BO",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                closeUserMenu();
            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, [closeUserMenu]);

    return (
        <header className="header">

            {/* LOGO */}
            <div className="header__logo">

                {tiendaActiva?.imagen && (
                    <img
                        src={tiendaActiva.imagen}
                        alt={tiendaActiva.nombre}
                    />
                )}

            </div>

            {/* MENU MOBILE */}
            <button
                className="header__menu"
                aria-label="Abrir menú lateral"
                title="Abrir menú lateral"
                onClick={toggleSidebar}
            >
                <Menu size={22} />
            </button>

            {/* FECHA */}
            <div className="header__left">

                <span className="header__date">
                    {fecha}
                </span>

            </div>

            {/* TIENDA */}
            <div className="header__store">

                <h1>
                    {tiendaActiva?.nombre || ""}
                </h1>

                <span>
                    {tiendaActiva?.descripcion || ""}
                </span>

            </div>

            {/* USUARIO */}
            <div className="header__right">

                <div
                    ref={wrapperRef}
                    className="header__user-wrapper"
                >

                    <button
                        type="button"
                        className="header__user"
                        onClick={() => toggleUserMenu()}
                    >

                        <div className="header__user-icon">
                            <User size={18} />
                        </div>

                        <div className="header__user-info">
                            <strong>
                                {usuario?.nombre}
                            </strong>
                        </div>

                    </button>

                    {userMenuOpen && (
                        <UserMenu />
                    )}

                </div>

            </div>

        </header>
    );
}

export default Header;