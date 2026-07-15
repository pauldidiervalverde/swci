import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader/PageHeader";
import IngresoForm from "./IngresoForm";
import { ingresosService } from "../../services/ingresosService";
import { useIngresoStore } from "../../stores/ingresoStore";
function IngresoEdit() {
    const ingresoId = useIngresoStore(
        (state) => state.ingresoId
    );
    const clearIngresoId = useIngresoStore(
        (state) => state.clearIngresoId
    );
    const navigate = useNavigate();
    // const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [ingreso, setIngreso] = useState(null);

    useEffect(() => {
        if (!ingresoId) {
            navigate("/ingresos");
            return;
        }
        const loadIngreso = async () => {
            try {
                Swal.fire({
                    title: "Cargando...",
                    text: "Obteniendo información del ingreso.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });
                const response = await ingresosService.getById(ingresoId);
                Swal.close();
                if (response.success) {
                    setIngreso(response.data);
                }
            } catch (error) {
                Swal.close();
                Swal.fire({
                    title: "Error",
                    text:
                        error?.response?.data?.message ||
                        "No se pudo cargar el ingreso.",
                    icon: "error",
                    confirmButtonColor: "var(--color-primary)"
                });
                navigate("/ingresos");
            } finally {
                setLoading(false);
            }
        };
        loadIngreso();
    }, [ingresoId, navigate]);
    // useEffect(() => {
    //     if (!ingresoId) {
    //         navigate("/ingresos");
    //         return;
    //     }
    //     loadIngreso();
    // }, [ingresoId]);
    const handleSave = async (payload) => {
        try {
            Swal.fire({
                title: "Procesando...",
                text: "Actualizando ingreso...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await ingresosService.update(ingresoId, payload);
            Swal.close();
            if (response.success) {
                Swal.fire({
                    title: "Actualizado",
                    text: "El ingreso fue actualizado correctamente.",
                    icon: "success",
                    confirmButtonColor: "var(--color-primary)",
                    timer: 2500
                });
                navigate("/ingresos");
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "No se pudo actualizar el ingreso.",
                icon: "error",
                confirmButtonColor: "var(--color-primary)"
            });
        }
    };
    const handleCancel = () => {
        clearIngresoId();
        navigate("/ingresos");
    };
    if (loading) {
        return null;
    }
    return (
        <div className="marcas">
            <PageHeader
                title="Editar Ingreso"
                subtitle="Modificar lote de productos"
            />
            <IngresoForm
                mode="edit"
                initialData={ingreso}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
}
export default IngresoEdit;