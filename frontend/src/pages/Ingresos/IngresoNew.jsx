import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader/PageHeader";
import IngresoForm from "./IngresoForm";
import { ingresosService } from "../../services/ingresosService";
import DraftLoad from "../../components/DraftLoad/DraftLoad";
import { removeDraft } from "../../stores/draftStorage";
// import Button from "../../components/Button/Button";
// import { Upload } from "lucide-react";
// import StockImportModal from "../Imports/StockImportModal";
// import { categoriasService } from "../../services/categoriasService";
// //import { marcasService } from "../../services/marcasService";
// import { productosService } from "../../services/productosService";

function IngresoNew() {
    const navigate = useNavigate();
    const [draftData, setDraftData] = useState(null);
    const [draftReady, setDraftReady] = useState(false);

    const handleSave = async (payload) => {
        try {
            Swal.fire({
                title: "Procesando...",
                text: "Registrando el lote de ingresos, por favor espera.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const response = await ingresosService.create(payload);
            Swal.close();
            if (response.success) {
                Swal.fire({
                    title: "¡Registrado!",
                    text: "El lote de ingresos se guardó correctamente.",
                    icon: "success",
                    confirmButtonColor: "var(--color-primary)",
                    timer: 2500
                });
                removeDraft("draft_ingreso");
                navigate("/ingresos");
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error en el servidor",
                text:
                    error?.response?.data?.message ||
                    "Error de conexión. Revisar Internet.",
                icon: "error",
                confirmButtonColor: "var(--color-primary)"
            });
        }
    };
    const handleCancel = () => {
        removeDraft("draft_ingreso");
        navigate("/ingresos");
    };
    const handleLoadDraft = (draft) => {

        setDraftData(draft);
        setDraftReady(true);
    };
    return (
        <div className="page-container">
            <DraftLoad
                mode="new"
                storageKey="draft_ingreso"
                onLoad={handleLoadDraft}
                onReady={() => setDraftReady(true)}
            />
            <PageHeader
                title="Ingresos de Mercadería"
                subtitle="Control y registro de lotes de productos ingresados"
            />

            <IngresoForm
                mode="new"
                initialData={draftData}
                draftReady={draftReady}
                onSave={handleSave}
                onCancel={handleCancel}
            />

        </div>
    );
}
export default IngresoNew;