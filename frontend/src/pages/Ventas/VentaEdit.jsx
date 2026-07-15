import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader/PageHeader";
import VentaForm from "./VentaForm";
import { ventasService } from "../../services/ventasService";
import { useVentaStore } from "../../stores/ventaStore";
function VentaEdit() {
    const navigate = useNavigate();
    const ventaId = useVentaStore(
        (state) => state.ventaId
    );
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] =
        useState(true);
    useEffect(() => {
        const cargarVenta = async () => {
            if (!ventaId) {
                navigate("/ventas");
                return;
            }
            try {
                setLoading(true);
                const response =
                    await ventasService.getById(
                        ventaId
                    );
                if (response.success) {
                    setVenta(response.data);
                }
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text:
                        error?.response?.data?.message ||
                        "No fue posible cargar la venta.",
                    icon: "error",
                    confirmButtonColor:
                        "var(--color-primary)",
                });
                navigate("/ventas");
            } finally {
                setLoading(false);
            }
        };
        cargarVenta();
    }, [ventaId, navigate]);
    const handleSave = async (payload) => {
        try {
            Swal.fire({
                title: "Actualizando...",
                text:
                    "Guardando cambios de la venta.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () =>
                    Swal.showLoading(),
            });
            const response =
                await ventasService.update(
                    ventaId,
                    payload
                );
            Swal.close();
            if (response.success) {
                await Swal.fire({
                    title: "Correcto",
                    text:
                        "La venta fue actualizada correctamente.",
                    icon: "success",
                    confirmButtonColor:
                        "var(--color-primary)",
                });
                navigate("/ventas");
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "No fue posible actualizar la venta.",
                icon: "error",
                confirmButtonColor:
                    "var(--color-primary)",
            });
        }
    };
    const handleCancel = () => {
        navigate("/ventas");
    };
    if (loading) {
        return (
            <div className="ventas">
                <PageHeader
                    title="Ventas"
                    subtitle="Edición de venta"
                />
                <p>Cargando información...</p>
            </div>
        );
    }
    return (
        <div className="page-container">
            <PageHeader
                title="Ventas"
                subtitle="Editar información de una venta"
            />
            <VentaForm
                mode="edit"
                initialData={venta}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
}
export default VentaEdit;