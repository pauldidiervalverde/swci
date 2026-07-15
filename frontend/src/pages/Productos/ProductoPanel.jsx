import Button from "../../components/Button/Button";
import ProductoForm from "./ProductoForm";
import "./ProductoPanel.css";
function ProductoPanel({
    producto,
    productos,
    categoriaInicial,
    onSave,
    onCancel,
}) {
    return (
        <div className="producto-panel">
            <div className="producto-panel__header">
                <div>
                    <h2 className="producto-panel__title">
                        {producto
                            ? "Editar Producto"
                            : "Nuevo Producto"}
                    </h2>
                    <p className="producto-panel__subtitle">
                        Complete la información del producto
                    </p>
                </div>
                <div className="producto-panel__actions">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="producto-form"
                    >
                        Guardar
                    </Button>
                </div>
            </div>
            <div className="producto-panel__body">
                <ProductoForm
                    producto={producto}
                    productos={productos}
                    categoriaInicial={categoriaInicial}
                    onSubmit={onSave}
                    onCancel={onCancel}
                    showButtons={false}
                />
            </div>
        </div>
    );
}
export default ProductoPanel;