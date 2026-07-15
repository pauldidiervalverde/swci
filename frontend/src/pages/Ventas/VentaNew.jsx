import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader/PageHeader";
import VentaForm from "./VentaForm";
import { ventasService } from "../../services/ventasService";
function VentaNew() {
    const navigate = useNavigate();
    const handleSave = async (payload) => {
        try {
            Swal.fire({
                title: "Procesando...",
                text: "Registrando la venta, por favor espera.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const response =
                await ventasService.create(payload);
            Swal.close();
            if (response.success) {
                await Swal.fire({
                    title: "¡Venta registrada!",
                    text: "La venta se registró correctamente.",
                    icon: "success",
                    confirmButtonColor:
                        "var(--color-primary)",
                    timer: 2500,
                });
                navigate("/ventas");
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error del servidor",
                text:
                    error?.response?.data?.message ||
                    "No fue posible registrar la venta.",
                icon: "error",
                confirmButtonColor:
                    "var(--color-primary)",
            });
        }
    };
    const handleCancel = () => {
        navigate("/ventas");
    };
    return (
        <div className="page-container">
            <PageHeader
                title="Nueva Venta"
                subtitle="Registro de venta comercial de productos"
            />
            <VentaForm
                mode="new"
                initialData={null}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
}
export default VentaNew;