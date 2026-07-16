import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Productos from "../pages/Productos/Productos";
import Categorias from "../pages/Categorias/Categorias";
import Marcas from "../pages/Marcas/Marcas";
import Login from "../pages/Login/Login";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Ingresos from "../pages/Ingresos/Ingresos";
import IngresoNew from "../pages/Ingresos/IngresoNew";
import IngresoEdit from "../pages/Ingresos/IngresoEdit";
import Salidas from "../pages/Salidas/Salidas";
import SalidaNew from "../pages/Salidas/SalidaNew";
import SalidaEdit from "../pages/Salidas/SalidaEdit";
import Existencias from "../pages/Existencias/Existencias";
import Kardex from "../pages/Kardex/Kardex";
//import Ajustes from "../pages/Ajustes/Ajustes";
import Ventas from "../pages/Ventas/Ventas";
import VentaNew from "../pages/Ventas/VentaNew";
import VentaEdit from "../pages/Ventas/VentaEdit";
import Clientes from "../pages/Clientes/Clientes";
import { NotaVenta } from "../pages/Ventas/NotaVenta";
import { NotaIngreso } from "../pages/Ingresos/NotaIngreso";
import { NotaSalida } from "../pages/Salidas/NotaSalida";
import UserProfile from "../pages/Usuarios/UserProfile";
import Help from "../pages/Help/Help";

// import ReporteDiarioVentas from "../pages/Reportes/ReporteDiarioVentas";
import { Respaldo } from "../pages/Respaldos/Respaldo";
import DetailKardex from "../pages/Kardex/DetailKardex";
import Auditoria from "../pages/Auditoria/Auditoria";
import ReportDay from "../pages/ReportesDia/ReportDay";
import Usuarios from "../pages/Usuarios/Usuarios";
// import RolPermisos from "../pages/Roles/RolPermisos";
import Roles from "../pages/Roles/Roles";
import RolPermisos from "../pages/Roles/RolPermisos";
export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <AuthLayout>
                                <Login />
                            </AuthLayout>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <DashboardLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Dashboard />} />

                    <Route path="productos" element={<Productos />} />
                    <Route path="categorias" element={<Categorias />} />
                    <Route path="marcas" element={<Marcas />} />

                    <Route path="ingresos" element={<Ingresos />} />
                    <Route path="/ingresos/nuevo" element={<IngresoNew />} />
                    <Route path="/ingresos/editar" element={<IngresoEdit />} />
                    <Route path="/ingresos/imprimir/:id" element={<NotaIngreso />} />

                    <Route path="existencias" element={<Existencias />} />
                    <Route path="kardex" element={<Kardex />} />
                    <Route path="/kardex/mostrar/:id" element={<DetailKardex />} />

                    <Route path="auditoria" element={<Auditoria />} />

                    <Route path="reportesdia" element={<ReportDay />} />



                    <Route path="ventas" element={<Ventas />} />
                    <Route path="/ventas/nuevo" element={<VentaNew />} />
                    <Route path="/ventas/editar" element={<VentaEdit />} />
                    <Route path="/ventas/imprimir/:id" element={<NotaVenta />} />
                    <Route path="clientes" element={<Clientes />} />

                    <Route path="salidas" element={<Salidas />} />
                    <Route path="/salidas/nuevo" element={<SalidaNew />} />
                    <Route path="/salidas/editar" element={<SalidaEdit />} />
                    <Route path="/salidas/imprimir/:id" element={<NotaSalida />} />

                    {/* /roles/${rol.id}/permisos  */}
                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="roles" element={<Roles />} />
                    <Route path="/roles/:id/permisos" element={<RolPermisos />} />

                    <Route path="configuracion" element={<Respaldo />} />

                    <Route path="perfil" element={<UserProfile />} />
                    <Route path="help" element={<Help />} />

                </Route>
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
