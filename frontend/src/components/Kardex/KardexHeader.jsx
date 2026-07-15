import "./KardexHeader.css";
import { Package, Tag, Palette, Ruler, Boxes } from "lucide-react";
function KardexHeader({ producto }) {
    if (!producto) return null;
    return (
        <section className="kardex-header">
            <div className="kardex-header__image">
                {producto.imagenPrincipal ? (
                    <img
                        src={producto.imagenPrincipal}
                        alt={producto.descripcion}
                    />
                ) : (
                    <div className="kardex-header__placeholder">
                        <Package size={46} />
                    </div>
                )}
            </div>
            <div className="kardex-header__content">
                <div className="kardex-header__top">
                    <div>
                        <span className="kardex-header__codigo">
                            {producto.codigo}
                        </span>
                        <h2>
                            {producto.descripcion}
                        </h2>
                    </div>
                    <div className="kardex-header__stock">
                        <span>Stock Actual</span>
                        <strong>{producto.stockActual}</strong>
                    </div>
                </div>
                <div className="kardex-header__grid">
                    <div>
                        <Tag size={16} />
                        <label>SKU</label>
                        <span>{producto.sku}</span>
                    </div>
                    <div>
                        <Boxes size={16} />
                        <label>Marca</label>
                        <span>{producto.marca?.nombre}</span>
                    </div>
                    <div>
                        <Package size={16} />
                        <label>Categoría</label>
                        <span>{producto.categoria?.nombre}</span>
                    </div>
                    <div>
                        <Palette size={16} />
                        <label>Color</label>
                        <span>{producto.color}</span>
                    </div>
                    <div>
                        <Ruler size={16} />
                        <label>Tallas</label>
                        <span>{producto.tallas}</span>
                    </div>
                    <div>
                        <Package size={16} />
                        <label>Precio Venta</label>
                        <span>
                            Bs {Number(producto.precioVenta).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default KardexHeader;