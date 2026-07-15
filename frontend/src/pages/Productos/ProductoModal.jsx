import Modal from "../../components/Modal/Modal";

import ProductoForm from "./ProductoForm";

function ProductoModal({
    producto,
    productos,
    categoriaInicial,
    onSave,
    onClose,
}) {

    return (
        <Modal
            title={
                producto
                    ? "Editar Producto"
                    : "Nuevo Producto"
            }
            onClose={onClose}
        >
            <ProductoForm
                producto={producto}
                productos={productos}
                onSubmit={onSave}
                onCancel={onClose}
                showButtons={true}
                categoriaInicial={categoriaInicial}
            />
        </Modal>
    );

}

export default ProductoModal;