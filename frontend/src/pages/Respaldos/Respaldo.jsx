import { useState } from "react";
import Swal from "sweetalert2";
import { Database } from "lucide-react";
import { respaldoService } from "../../services/respaldoService";
import "./Respaldo.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import Button from "../../components/Button/Button";

export const Respaldo = () => {
    const [loading, setLoading] = useState(false);

    const handleCrearRespaldo = async () => {
        // Alerta de SweetAlert2 pidiendo la contraseña para validación local de seguridad
        const { value: password } = await Swal.fire({
            title: "Confirmar Acción",
            text: "Por seguridad, introduce tu contraseña para generar la copia de respaldo.",
            input: "password",
            inputPlaceholder: "Escribe tu contraseña",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "var(--color-info)", // Usando tus variables de estado
            cancelButtonColor: "var(--color-danger)",
            inputValidator: (value) => {
                if (!value) {
                    return "¡Debes ingresar tu contraseña para continuar!";
                }
            },
        });

        // Si canceló o cerró la alerta, no hace nada
        if (!password) return;

        try {
            setLoading(true);

            // Pantalla de carga mientras el backend procesa el volcado
            Swal.fire({
                title: "Generando copia de seguridad...",
                text: "Por favor, no cierres la ventana.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Petición limpia al servicio (el middleware del backend valida la sesión)
            const response = await respaldoService.crearCopia();

            Swal.fire({
                icon: "success",
                title: "¡Respaldo Exitoso!",
                text: response.message || "La copia de seguridad se ha creado correctamente.",
                confirmButtonColor: "var(--color-success)",
            });

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error al generar respaldo",
                text: error.response?.data?.message || "Ocurrió un error en el servidor.",
                confirmButtonColor: "var(--color-danger)",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <PageHeader
                title="Copias de Seguridad"
                subtitle="Administración y respaldos de la Base de Datos"
            />

            <div className="respaldo__content-card">
                <div className="respaldo__info">
                    <h3>Crear Punto de Restauración</h3>
                    <p>
                        Al hacer clic en el botón, el sistema generará un archivo de respaldo con
                        toda la información actual de las tablas. Esta acción está protegida
                        por tus permisos de usuario actuales.
                    </p>
                </div>

                <div className="respaldo__actions">
                    <Button
                        icon={<Database size={18} />}
                        onClick={handleCrearRespaldo}
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : "Crear Copia de Respaldo"}
                    </Button>
                </div>
            </div>
        </div>
    );
};