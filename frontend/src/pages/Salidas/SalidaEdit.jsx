import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SalidaForm from "./SalidaForm";
import { salidasService } from "../../services/salidasService";
import { useSalidaStore } from "../../stores/salidaStore";
import "../Ingresos/Ingresos.css";
import PageHeader from "../../components/PageHeader/PageHeader";
function SalidaEdit() {
    const navigate = useNavigate();
    const { id, clear } = useSalidaStore();
    const [loading, setLoading] = useState(true);
    const [salida, setSalida] = useState(null);
    ////////////////////////////////////////////////////////////
    // Si no existe ID regresar al listado
    ////////////////////////////////////////////////////////////
    useEffect(() => {
        if (!id) { navigate("/salidas"); }
    }, [id, navigate]);
    ////////////////////////////////////////////////////////////
    // Cargar salida
    ////////////////////////////////////////////////////////////
    useEffect(() => {
        if (!id) return;
        const loadSalida = async () => {
            try {
                Swal.fire({
                    title: "Cargando...",
                    text: "Obteniendo información de la salida.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading(),
                });
                const response =
                    await salidasService.getById(id);
                Swal.close();
                if (response.success) {
                    setSalida(response.data);
                }
            } catch (error) {
                Swal.close();
                Swal.fire({
                    title: "Error",
                    text:
                        error?.response?.data?.message ||
                        "No se pudo cargar la salida.",
                    icon: "error",
                    confirmButtonColor:
                        "var(--color-primary)",
                });
                clear();
                navigate("/salidas");
            } finally {
                setLoading(false);
            }
        };
        loadSalida();
    }, [id, navigate, clear]);
    ////////////////////////////////////////////////////////////
    // Guardar cambios
    ////////////////////////////////////////////////////////////
    const handleSave = async (payload) => {
        try {
            Swal.fire({
                title: "Actualizando...",
                text: "Guardando cambios.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });
            const response =
                await salidasService.update(
                    id,
                    payload,
                );
            Swal.close();
            if (response.success) {
                await Swal.fire({
                    title: "Correcto",
                    text:
                        "La salida fue actualizada correctamente.",
                    icon: "success",
                    confirmButtonColor:
                        "var(--color-primary)",
                });
                clear();
                navigate("/salidas");
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "No se pudo actualizar la salida.",
                icon: "error",
                confirmButtonColor:
                    "var(--color-primary)",
            });
        }
    };
    const handleCancel = () => {
        clear();
        navigate("/salidas");
    };
    ////////////////////////////////////////////////////////////
    if (loading) {
        return null;
    }
    ////////////////////////////////////////////////////////////
    return (
        <div className="marcas">
            <PageHeader
                title="Egresos / Salidas"
                subtitle="Promociones, regalos y canjes."
            />
            <SalidaForm
                mode="edit"
                initialData={salida}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
}
export default SalidaEdit;