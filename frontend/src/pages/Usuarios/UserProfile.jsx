import { useState } from "react";
import { useAuthStore } from "../../stores/authStore"; // Ajusta la ruta según tu proyecto
import {
    User,
    ShieldCheck,
    Eye,
    EyeOff,
    Lock,
    // TrendingUp,
    // FileLeft,
    // ArrowLeftRight,
    // ShoppingBag,
    Calendar
} from "lucide-react";
//import DashboardCard from "../../components/DashboardCard/DashboardCard"; // Ajusta la ruta
import Button from "../../components/Button/Button"; // Ajusta la ruta
import Input from "../../components/Input/Input"; // Ajusta la ruta
import { api } from "../../services/api"; // Ajusta la ruta a tu cliente Axios/Fetch
import "./UserProfile.css";

function UserProfile() {
    // 1. Extraer datos del estado global de Zustand
    const { usuario } = useAuthStore();

    // 2. Estados para el formulario de cambiar contraseña
    const [passwordActual, setPasswordActual] = useState("");
    const [nuevoPassword, setNuevoPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");

    // Estados para visibilidad de contraseñas (Ver/Ocultar)
    const [showActual, setShowActual] = useState(false);
    const [showNuevo, setShowNuevo] = useState(false);
    const [showConfirmar, setShowConfirmar] = useState(false);

    // Estados de control del formulario
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [mensajeExito, setMensajeExito] = useState("");

    // 3. Estados para los contadores y procesos (Resumen Backend)
    // const [resumenProcesos, setResumenProcesos] = useState({
    //     ingresos: 0,
    //     ventas: 0,
    //     movimientos: 0,
    //     tendenciaIngresos: 0,
    //     tendenciaVentas: 0
    // });

    // 4. Carga de datos estadísticos desde el backend al montar el componente
    // useEffect(() => {
    //     const cargarResumenPerfil = async () => {
    //         try {
    //             // Endpoint sugerido para obtener los procesos realizados por el usuario en la tienda activa
    //             const response = await api.get("/usuarios/perfil/resumen");
    //             if (response.data?.success) {
    //                 setResumenProcesos(response.data.data);
    //             }
    //         } catch (error) {
    //             console.error("Error al cargar resumen de actividad del usuario:", error);
    //             // Valores de respaldo en caso de que aún no crees el endpoint en el backend
    //             setResumenProcesos({
    //                 ingresos: usuario?.ingresos?.length || 0,
    //                 ventas: usuario?.ventas?.length || 0,
    //                 movimientos: usuario?.movimientos?.length || 0,
    //                 tendenciaIngresos: 4.8,
    //                 tendenciaVentas: 12.5
    //             });
    //         }
    //     };

    //     cargarResumenPerfil();
    // }, [usuario, tiendaActiva]);

    // 5. Manejador del cambio de contraseña con validaciones estrictas
    const handleCambiarPassword = async (e) => {
        e.preventDefault();
        setErrores({});
        setMensajeExito("");

        const nuevosErrores = {};

        if (!passwordActual) nuevosErrores.passwordActual = "La contraseña actual es obligatoria";
        if (!nuevoPassword) {
            nuevosErrores.nuevoPassword = "La nueva contraseña es obligatoria";
        } else if (nuevoPassword.length < 6) {
            nuevosErrores.nuevoPassword = "La nueva contraseña debe tener al menos 6 caracteres";
        }

        if (nuevoPassword !== confirmarPassword) {
            nuevosErrores.confirmarPassword = "Las contraseñas nuevas no coinciden";
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        try {
            setLoading(true);
            // Petición al endpoint del Backend
            const response = await api.patch(`/usuarios/${usuario?.id}/password`, {

                password: passwordActual,
                nuevoPassword
            });

            if (response.data?.success) {
                setMensajeExito("¡Contraseña actualizada correctamente!");
                // Limpiar campos del formulario
                setPasswordActual("");
                setNuevoPassword("");
                setConfirmarPassword("");
            } else {
                setErrores({ global: response.data?.message || "Ocurrió un error inesperado" });
            }
        } catch (error) {
            console.error(error);
            setErrores({
                global: error.response?.data?.message || "La contraseña actual es incorrecta o hubo un error en el servidor."
            });
        } finally {
            setLoading(false);
        }
    };

    // Formatear la fecha de creación de la cuenta
    const fechaRegistro = usuario?.createdAt
        ? new Date(usuario.createdAt).toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" })
        : "No disponible";

    return (
        <div className="profile-container">
            {/* SECCIÓN 1: DATOS PERSONALES DEL USUARIO (CARD PRINCIPAL) */}
            <section className="profile-section">
                <div className="profile-user-card">
                    <div className="profile-user-card__avatar-wrapper">
                        <div className="profile-user-card__avatar">
                            <User size={48} className="profile-user-card__avatar-icon" />
                        </div>
                        <span className={`profile-user-card__badge ${usuario?.estado ? "profile-user-card__badge--active" : ""}`}>
                            {usuario?.estado ? "Activo" : "Inactivo"}
                        </span>
                    </div>

                    <div className="profile-user-card__info">
                        <h1 className="profile-user-card__name">{usuario?.nombre || "Usuario del Sistema"}</h1>
                        <p className="profile-user-card__username">@{usuario?.usuario || "sin_usuario"}</p>

                        <div className="profile-user-card__meta-grid">
                            <div className="profile-user-card__meta-item">
                                <ShieldCheck size={16} className="profile-user-card__meta-icon" />
                                <span>Rol: <strong>{usuario?.rol?.nombre || "Personal de Tienda"}</strong></span>
                            </div>
                            <div className="profile-user-card__meta-item">
                                <Calendar size={16} className="profile-user-card__meta-icon" />
                                <span>Miembro desde: {fechaRegistro}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 2: TARJETAS INFORMATIVAS (RESUMEN DE PROCESOS REALIZADOS) */}
            {/* <section className="profile-section">
                <h2 className="profile-section__title">Resumen de Actividad (Tienda Activa)</h2>
                <div className="profile-dashboard-grid">
                    <DashboardCard
                        title="Lotes de Ingresos Registrados"
                        value={resumenProcesos.ingresos}
                        icon={FileLeft}
                        trend={resumenProcesos.tendenciaIngresos}
                        status="info"
                    />
                    <DashboardCard
                        title="Ventas Realizadas"
                        value={resumenProcesos.ventas}
                        icon={ShoppingBag}
                        trend={resumenProcesos.tendenciaVentas}
                        status="success"
                    />
                    <DashboardCard
                        title="Movimientos de Inventario"
                        value={resumenProcesos.movimientos}
                        icon={ArrowLeftRight}
                        status="warning"
                    />
                </div>
            </section> */}

            {/* SECCIÓN 3: CAMBIAR CONTRASEÑA (ESTILO WHATSAPP/WINDOWS CON VER/OCULTAR) */}
            <section className="profile-section">
                <div className="profile-password-card">
                    <div className="profile-password-card__header">
                        <Lock size={20} className="profile-password-card__header-icon" />
                        <h2 className="profile-password-card__title">Seguridad de la Cuenta</h2>
                    </div>
                    <p className="profile-password-card__subtitle">
                        Cambia tu contraseña regularmente para mantener blindada tu cuenta en el inventario.
                    </p>

                    <form onSubmit={handleCambiarPassword} className="profile-password-card__form">
                        {errores.global && <div className="profile-alert profile-alert--danger">{errores.global}</div>}
                        {mensajeExito && <div className="profile-alert profile-alert--success">{mensajeExito}</div>}

                        {/* Campo: Contraseña Actual */}
                        <div className="profile-form-group-password">
                            <Input
                                type={showActual ? "text" : "password"}
                                label="Contraseña Actual"
                                value={passwordActual}
                                onChange={(e) => setPasswordActual(e.target.value)}
                                error={errores.passwordActual}
                                placeholder="Escribe tu contraseña actual"
                            />
                            <button
                                type="button"
                                className="profile-password-toggle-btn"
                                onClick={() => setShowActual(!showActual)}
                                aria-label="Mostrar u ocultar contraseña"
                            >
                                {showActual ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Campo: Nueva Contraseña */}
                        <div className="profile-form-group-password">
                            <Input
                                type={showNuevo ? "text" : "password"}
                                label="Nueva Contraseña"
                                value={nuevoPassword}
                                onChange={(e) => setNuevoPassword(e.target.value)}
                                error={errores.nuevoPassword}
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                className="profile-password-toggle-btn"
                                onClick={() => setShowNuevo(!showNuevo)}
                                aria-label="Mostrar u ocultar contraseña"
                            >
                                {showNuevo ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Campo: Confirmar Nueva Contraseña */}
                        <div className="profile-form-group-password">
                            <Input
                                type={showConfirmar ? "text" : "password"}
                                label="Confirmar Nueva Contraseña"
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.target.value)}
                                error={errores.confirmarPassword}
                                placeholder="Repite tu nueva contraseña"
                            />
                            <button
                                type="button"
                                className="profile-password-toggle-btn"
                                onClick={() => setShowConfirmar(!showConfirmar)}
                                aria-label="Mostrar u ocultar contraseña"
                            >
                                {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="profile-password-card__actions">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? "Actualizando..." : "Actualizar Contraseña"}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default UserProfile;
