import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SalidaForm from "./SalidaForm";
import { salidasService } from "../../services/salidasService";
import "../Ingresos/Ingresos.css";
import PageHeader from "../../components/PageHeader/PageHeader";

function SalidaNew() {
    const navigate = useNavigate();
    ////////////////////////////////////////////////////////////
    // Guardar
    ////////////////////////////////////////////////////////////
    const handleSave = async (payload) => {
        try {
            Swal.fire({
                title: "Guardando...",
                text: "Registrando la salida.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });
            const response =
                await salidasService.create(payload);
            Swal.close();
            if (response.success) {
                await Swal.fire({
                    title: "Correcto",
                    text: "La salida fue registrada correctamente.",
                    icon: "success",
                    confirmButtonColor:
                        "var(--color-primary)",
                    timer: 2500
                });
                navigate("/salidas");
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "No se pudo registrar la salida.",
                icon: "error",
                confirmButtonColor:
                    "var(--color-primary)",
            });
        }
    };
    const handleCancel = () => {
        navigate("/salidas");
    };
    ////////////////////////////////////////////////////////////
    return (
        <div className="marcas">
            <PageHeader
                title="Nuevo Egreso"
                subtitle="Promociones, regalos y canjes."
            />
            <SalidaForm
                mode="new"
                initialData={null}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>

    );
}
export default SalidaNew;