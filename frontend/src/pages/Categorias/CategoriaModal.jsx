import Modal from "../../components/Modal/Modal";

import CategoriaForm from "./CategoriaForm";

// import "./CategoriaModal.css";

function CategoriaModal({
    categoria,
    categorias,
    onSave,
    onClose,
}) {
    return (
        <Modal

            title={
                categoria
                    ? "Editar Categoría"
                    : "Nueva Categoría"
            }
            onClose={onClose}
        >
            <CategoriaForm
                categoria={categoria}
                categorias={categorias}
                onSubmit={onSave}
                onCancel={onClose}
            />
        </Modal>
    );
}

export default CategoriaModal;