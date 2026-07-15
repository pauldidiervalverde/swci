import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { menuService } from "../../services/menuService";
import { useAuthStore } from "../../stores/authStore";
import { useMenuStore } from "../../stores/menuStore";
import "./Login.css";
import Swal from "sweetalert2";
export default function Login() {
    const navigate = useNavigate();
    const loginStore = useAuthStore((state) => state.login);
    const seleccionarTienda = useAuthStore((state) => state.seleccionarTienda);
    const setMenu = useMenuStore((state) => state.setMenu);
    const [form, setForm] = useState({
        usuario: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showTiendas, setShowTiendas] = useState(false);
    const [tiendas, setTiendas] = useState([]);
    const usuarioRef = useRef(null);
    const passwordRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const usuario = usuarioRef.current?.value?.trim() ?? "";
            const password = passwordRef.current?.value?.trim() ?? "";

            if (!usuario) {
                usuarioRef.current?.focus();
            } else if (!password) {
                passwordRef.current?.focus();
            } else {
                buttonRef.current?.focus();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const isFormValid =
        form.usuario.trim() !== "" &&
        form.password.trim() !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.usuario.trim()) return;
        try {
            setLoading(true);
            const response =
                await authService.login(form);
            const data = response.data;
            loginStore(data);
            /*
             * Cargar menú del usuario
             */
            const menuResponse =
                await menuService.getMenu();
            // console.log(menuResponse.data);
            setMenu(
                menuResponse.data
            );
            if (data.tiendas.length === 1) {
                seleccionarTienda(
                    data.tiendas[0]
                );
                navigate("/");
                return;
            }
            setTiendas(data.tiendas);
            setShowTiendas(true);
        } catch (error) {
            console.error(error);

            let icon = "warning";
            let title;
            let html;

            // El servidor respondió (401, 500, etc.)
            if (error.response) {

                switch (error.response.status) {

                    case 401:
                        title = "Credenciales incorrectas";
                        html = `
                    <p>El usuario o la contraseña ingresados no son válidos.</p>
                    <p>Verifique sus datos e intente nuevamente.</p>
                `;
                        break;

                    case 403:
                        title = "Acceso denegado";
                        html = `
                    <p>Su cuenta no tiene autorización para acceder al sistema.</p>
                    <p>Si considera que se trata de un error, comuníquese con el administrador.</p>
                `;
                        break;

                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        title = "Servidor no disponible";
                        html = `
                    <p>No fue posible establecer comunicación con el servidor.</p>
                    <p>Intente nuevamente en unos minutos.</p>
                `;
                        break;

                    default:
                        title = "No fue posible iniciar sesión";
                        html = `
                    <p>Ocurrió un inconveniente durante la autenticación.</p>
                    <p>Intente nuevamente dentro de unos momentos.</p>
                `;
                }

            }
            // Timeout
            else if (error.code === "ECONNABORTED" ||
                error.code === "ETIMEDOUT" ||
                (error.message && error.message.toLowerCase().includes("timeout"))) {
                title = "Tiempo de espera agotado. Error Config / Server";
                html = `
                            <p>El servidor está tardando demasiado en responder.</p>
                            <p>Verifique su conexión y/o Configuracion e intente nuevamente.</p>
                        `;
            }
            // Sin conexión, CORS, servidor apagado, túnel caído, etc.
            else {
                title = "No existe conexión con el servidor. Error Net";
                html = `
                            <p>No se pudo establecer comunicación con el servidor.</p>
                            <p>Verifique su conexión a Internet o intente nuevamente más tarde.</p>
                        `;
            }

            await Swal.fire({
                icon,
                title,
                html,
                confirmButtonText: "Aceptar",
                confirmButtonColor: "var(--color-primary)",
                allowOutsideClick: false,
                allowEscapeKey: true,
                heightAuto: false,
            });

        } finally {
            setLoading(false);
        }
    };
    const handleSelectStore = (tienda) => {
        seleccionarTienda(tienda);
        navigate("/");
    };
    return (
        <>
            <div className="login">
                <div className="login__card">
                    <p className="login__subtitle">
                        Ingrese sus credenciales
                    </p>
                    <form
                        className="login__form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label>
                                Usuario
                            </label>
                            <input
                                ref={usuarioRef}
                                type="text"
                                name="usuario"
                                value={form.usuario}
                                onChange={handleChange}
                                placeholder="Usuario"
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                Contraseña
                            </label>
                            <input
                                ref={passwordRef}
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Contraseña"
                                autoComplete="current-password"
                            />
                        </div>
                        <button
                            ref={buttonRef}
                            type="submit"
                            className="login__button"
                            disabled={loading || !isFormValid}
                        >
                            {
                                loading
                                    ? "Ingresando..."
                                    : "Ingresar"
                            }
                        </button>
                    </form>
                </div>
            </div>
            {showTiendas && (
                <div className="store-modal">
                    <div className="store-modal__content">
                        <h2>
                            Seleccione una tienda
                        </h2>
                        <p>
                            Ingrese a su Modulo de Trabajo:
                        </p>
                        <div className="store-grid">
                            {tiendas.map((tienda) => (
                                <button
                                    key={tienda.id}
                                    className="store-card"
                                    onClick={() =>
                                        handleSelectStore(tienda)
                                    }
                                >
                                    <img
                                        src={tienda.imagen}
                                        alt={tienda.nombre}
                                    />
                                    <div className="store-card__footer">
                                        <h3>
                                            {tienda.descripcion}
                                        </h3>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}