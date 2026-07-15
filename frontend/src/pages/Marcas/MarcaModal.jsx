import Modal from "../../components/Modal/Modal";

import MarcaForm from "./MarcaForm";

// import "./MarcaModal.css";

function MarcaModal({
    marca,
    marcas,
    onSave,
    onClose,
}) {
    return (
        <Modal
            title={
                marca
                    ? "Editar Marca"
                    : "Nueva Marca"
            }
            onClose={onClose}
        >
            <MarcaForm
                marca={marca}
                marcas={marcas}
                onSubmit={onSave}
                onCancel={onClose}
            />
        </Modal>
    );
}

export default MarcaModal;