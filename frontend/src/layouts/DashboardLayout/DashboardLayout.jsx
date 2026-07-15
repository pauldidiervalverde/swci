import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useMenuStore } from "../../stores/menuStore";
import { useUIStore } from "../../stores/uiStore";
import { menuService } from "../../services/menuService";
import "./DashboardLayout.css";
import AppLoader from "../../components/AppLoader/AppLoader";
function DashboardLayout() {
    const menu = useMenuStore(
        (state) => state.menu
    );
    const setMenu = useMenuStore(
        (state) => state.setMenu
    );
    const sidebarOpen = useUIStore(
        (state) => state.sidebarOpen
    );
    const closeSidebar = useUIStore(
        (state) => state.closeSidebar
    );
    const [loading, setLoading] =
        useState(false);
    useEffect(() => {
        if (menu.length > 0) {
            return;
        }
        const loadMenu = async () => {
            try {
                setLoading(true);
                const res =
                    await menuService.getMenu();
                if (res?.success) {
                    setMenu(res.data);
                }
            } catch (error) {
                console.error(
                    "Error cargando menú:",
                    error
                );
            } finally {
                await new Promise(resolve =>
                    setTimeout(resolve, 3000)
                );
                setLoading(false);
            }
        };
        loadMenu();
    }, [menu.length, setMenu]);
    if (loading && menu.length === 0) {
        return (
            <AppLoader />
        );
    }
    return (
        <div className="layout">
            <Header />
            <div className="layout__body">
                <Sidebar />
                {sidebarOpen && (
                    <div
                        className="layout__overlay"
                        onClick={closeSidebar}
                    />
                )}
                <main className="layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
export default DashboardLayout;