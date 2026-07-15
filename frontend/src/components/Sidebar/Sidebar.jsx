import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { useMenuStore } from "../../stores/menuStore";
import { sidebarIcons } from "./sidebarIcons";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";

import "./Sidebar.css";

function Sidebar() {
    const menu = useMenuStore((state) => state.menu);

    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const closeSidebar = useUIStore((state) => state.closeSidebar);

    const location = useLocation();

    useEffect(() => {
        closeSidebar();
    }, [location.pathname]);

    // estado de grupos abiertos
    const [openGroups, setOpenGroups] = useState({});

    const toggleGroup = (group) => {
        setOpenGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    // agrupar menú por grupo
    const groupedMenu = menu.reduce((acc, item) => {
        const group = item.grupo || "GENERAL";

        if (!acc[group]) acc[group] = [];

        acc[group].push(item);

        return acc;
    }, {});

    return (
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            {/* <div className="sidebar__header">
                <h2 className="sidebar__title">INVENTARIO</h2>
            </div> */}

            <nav className="sidebar__menu">
                {Object.entries(groupedMenu).map(([group, items]) => {
                    const isOpen = openGroups[group];

                    return (
                        <div key={group} className="sidebar__group">
                            {/* HEADER DEL GRUPO */}
                            <button
                                className="sidebar__group-header"
                                onClick={() => toggleGroup(group)}
                            >
                                <span>{group}</span>
                                <span className="sidebar__group-arrow">
                                    {isOpen ? (
                                        <ChevronDown size={16} strokeWidth={2} />
                                    ) : (
                                        <ChevronRight size={16} strokeWidth={2} />
                                    )}
                                </span>
                            </button>

                            {/* ITEMS */}
                            <div
                                className={`sidebar__group-items ${isOpen ? "open" : ""
                                    }`}
                            >
                                {items
                                    .sort((a, b) => a.orden - b.orden)
                                    .map((item) => {
                                        const Icon =
                                            sidebarIcons[item.icono];

                                        return (
                                            <NavLink
                                                key={item.id}
                                                to={item.ruta}
                                                end={item.ruta === "/"}
                                                className={({ isActive }) =>
                                                    isActive
                                                        ? "sidebar__link active"
                                                        : "sidebar__link"
                                                }
                                            >
                                                {Icon && (
                                                    <Icon
                                                        size={18}
                                                        strokeWidth={2}
                                                    />
                                                )}

                                                <span className="sidebar__label">
                                                    {item.nombre}
                                                </span>
                                            </NavLink>
                                        );
                                    })}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}

export default Sidebar;