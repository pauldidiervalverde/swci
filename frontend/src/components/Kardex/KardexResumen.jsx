
import "./KardexResumen.css";

function KardexResumen({ producto }) {
    if (!producto) return null;

    return (
        <div className="kardex-resumen-card">
            <h2 className="kardex-resumen-title">Datos Técnicos del Producto</h2>
            <div className="kardex-resumen-grid">
                <div className="kardex-resumen-group">
                    <span className="kardex-resumen-label">SKU / Item</span>
                    <span className="kardex-resumen-value">{producto.sku}</span>
                </div>
                <div className="kardex-resumen-group">
                    <span className="kardex-resumen-label">Código</span>
                    <span className="kardex-resumen-value">#{producto.codigo}</span>
                </div>
                <div className="kardex-resumen-group">
                    <span className="kardex-resumen-label">Descripción</span>
                    <span className="kardex-resumen-value font-medium">{producto.descripcion}</span>
                </div>
                <div className="kardex-resumen-group">
                    <span className="kardex-resumen-label">Marca</span>
                    <span className="kardex-resumen-value">{producto.marca}</span>
                </div>
                <div className="kardex-resumen-group">
                    <span className="kardex-resumen-label">Categoría</span>
                    <span className="kardex-resumen-value">{producto.categoria}</span>
                </div>
                <div className="kardex-resumen-group">
                    <span className="kardex-resumen-label">Especificaciones</span>
                    <span className="kardex-resumen-value">Color: {producto.color} | Tallas: {producto.tallas}</span>
                </div>
                <div className="kardex-resumen-group">
                    <span className="kardex-resumen-label">U. Medida</span>
                    <span className="kardex-resumen-value">{producto.unidad}</span>
                </div>
                <div className="kardex-resumen-group">
                    <span className="kardex-resumen-label">Stock Mínimo Alerta</span>
                    <span className="kardex-resumen-value">{producto.stockMinimo} u.</span>
                </div>
            </div>
        </div>
    );
}

export default KardexResumen;