import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Save, Trash2 } from "lucide-react";
import Input from "../../components/Input/Input";
import SearchInput from "../../components/SearchInput/SearchInput";
import SelectField from "../../components/SelectField/SelectField";
import Button from "../../components/Button/Button";
import { useAuthStore } from "../../stores/authStore";
import { obtenerFechaBolivia } from "../../utils/normalizarHora";
import { useDebounce } from "../../hooks/useDebounce";
import { productosService } from "../../services/productosService";
import { categoriasService } from "../../services/categoriasService";
import { marcasService } from "../../services/marcasService";
import { clientesService } from "../../services/clientesService";
import { tipoMovimientosService } from "../../services/tipoMovimientosService";
import "../Ingresos/Ingresos.css";
import ClienteSearch from "../../components/ClienteSearch/ClienteSearch";
function SalidaForm({
    mode = "new",
    initialData = null,
    onSave,
    onCancel,
}) {
    const fechaActual = obtenerFechaBolivia();
    const usuario = useAuthStore(
        (state) => state.usuario.nombre
    );
    const tiendaActiva = useAuthStore(
        (state) => state.tiendaActiva
    );
    // CABECERA    
    const [clienteId, setClienteId] = useState(
        initialData?.clienteId || ""
    );
    const [tipoMovimientoId, setTipoMovimientoId] = useState(
        initialData?.tipoMovimientoId || ""
    );
    const [observacion, setObservacion] = useState(
        initialData?.observacion || ""
    );
    // CATALOGOS
    const [clientes, setClientes] = useState([]);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    // BUSCADOR PRODUCTOS
    const [productSearch, setProductSearch] = useState("");
    const [categoriaFiltroProducto,
        setCategoriaFiltroProducto] = useState("");
    const [marcaFiltroProducto,
        setMarcaFiltroProducto] = useState("");
    const debouncedProductSearch =
        useDebounce(productSearch, 300);
    const [productosDropdown,
        setProductosDropdown] = useState([]);
    // DETALLE
    const [detallesSalida, setDetallesSalida] =
        useState(() => {
            if (
                initialData &&
                Array.isArray(initialData.detalles)
            ) {
                return initialData.detalles.map((item) => ({
                    productoId:
                        item.productoId ??
                        item.producto?.id,
                    marca:
                        item.producto?.marca?.nombre ??
                        "",
                    codigo:
                        item.producto?.codigo ??
                        "",
                    descripcion:
                        item.producto?.descripcion ??
                        "",
                    tallas:
                        item.producto?.tallas ??
                        "U",
                    color:
                        item.producto?.color ??
                        "-",
                    stockActual:
                        item.producto?.stockActual ??
                        0,
                    cantidad:
                        Number(item.cantidad) || 1
                }));
            }
            return [];
        });
    // CARGAR CATALOGOS
    const loadClientes = async () => {
        try {
            const response =
                await clientesService.getAll();
            if (response.success) {
                setClientes(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            console.log(clientes)
        }
    }

    useEffect(() => {
        const loadCatalogos = async () => {
            try {
                const [
                    categoriasResponse,
                    marcasResponse,
                    clientesResponse,
                    tiposMovimientoResponse
                ] = await Promise.all([
                    categoriasService.getAll(),
                    marcasService.getAll(),
                    clientesService.getAll(),
                    tipoMovimientosService.getEgresos()
                ]);
                if (categoriasResponse.success) {
                    setCategorias(
                        categoriasResponse.data.filter(
                            (c) => c.estado
                        )
                    );
                }
                if (marcasResponse.success) {
                    setMarcas(
                        marcasResponse.data
                    );
                }
                if (clientesResponse.success) {
                    setClientes(
                        clientesResponse.data
                    );
                }
                if (tiposMovimientoResponse.success) {
                    setTiposMovimiento(
                        tiposMovimientoResponse.data
                    );
                }
            } catch (error) {
                console.error(
                    "Error cargando catálogos:",
                    error
                );
            }
        };
        loadCatalogos();
    }, []);
    // BUSCAR PRODUCTOS
    useEffect(() => {
        const buscarProductos = async () => {
            if (!debouncedProductSearch) {
                setProductosDropdown([]);
                return;
            }
            try {
                const params =
                    new URLSearchParams();
                params.append("page", 1);
                params.append(
                    "search",
                    debouncedProductSearch
                );
                if (categoriaFiltroProducto) {
                    params.append(
                        "categoriaId",
                        categoriaFiltroProducto
                    );
                }
                if (marcaFiltroProducto) {
                    params.append(
                        "marcaId",
                        marcaFiltroProducto
                    );
                }
                const response =
                    await productosService.getAll(
                        `?${params.toString()}`
                    );
                if (response.success) {
                    setProductosDropdown(
                        response.data?.data ||
                        response.data
                    );
                }
            } catch (error) {
                console.error(
                    "Error buscando productos:",
                    error
                );
            }
        };
        buscarProductos();
    }, [
        debouncedProductSearch,
        categoriaFiltroProducto,
        marcaFiltroProducto
    ]);
    // AGREGAR PRODUCTO
    const handleAddProductoSalida = (producto) => {
        const existe = detallesSalida.some(
            (item) => item.productoId === producto.id
        );
        if (existe) {
            Swal.fire({
                title: "¡Atención!",
                html: "El producto ya fue agregado a la salida.",
                icon: "warning",
                confirmButtonColor: "var(--color-primary)",
            });
            return;
        }
        if ((producto.stockActual ?? 0) <= 0) {
            Swal.fire({
                title: "Sin stock",
                text: "El producto no tiene existencias disponibles.",
                icon: "warning",
                confirmButtonColor: "var(--color-primary)",
            });
            return;
        }
        setDetallesSalida((prev) => [
            {
                productoId: producto.id,
                marca: producto.marca?.nombre || "",
                codigo: producto.codigo,
                descripcion: producto.descripcion,
                tallas: producto.tallas || "U",
                color: producto.color || "-",
                stockActual: producto.stockActual ?? 0,
                cantidad: 1
            },
            ...prev
        ]);
        setProductSearch("");
        setProductosDropdown([]);
    };
    // MODIFICAR CANTIDAD
    const handleUpdateCantidad = (
        index,
        value
    ) => {
        let cantidad = parseInt(value);
        if (Number.isNaN(cantidad))
            cantidad = 1;
        if (cantidad < 1)
            cantidad = 1;
        setDetallesSalida((prev) => {
            const copia = [...prev];
            if (
                cantidad >
                copia[index].stockActual
            ) {
                Swal.fire({
                    title: "Stock insuficiente",
                    text:
                        `Stock disponible: ${copia[index].stockActual}`,
                    icon: "warning",
                    confirmButtonColor:
                        "var(--color-primary)",
                });
                cantidad =
                    copia[index].stockActual;
            }
            copia[index].cantidad =
                cantidad;
            return copia;
        });
    };

    // ELIMINAR PRODUCTO

    const handleRemoveDetalle = (
        index
    ) => {
        setDetallesSalida((prev) =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    };

    // RESUMEN

    const totalProductos = useMemo(() => {
        return detallesSalida.reduce(
            (sum, item) =>
                sum + item.cantidad,
            0
        );
    }, [detallesSalida]);

    // GUARDAR

    const handleSubmit = async () => {
        if (!tipoMovimientoId) {
            Swal.fire({
                title: "Atención",
                text:
                    "Seleccione un tipo de movimiento.",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)",
            });
            return;
        }
        if (
            detallesSalida.length === 0
        ) {
            Swal.fire({
                title: "Atención",
                text:
                    "Debe agregar al menos un producto.",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)",
            });
            return;
        }
        for (const item of detallesSalida) {
            if (
                item.cantidad >
                item.stockActual
            ) {
                Swal.fire({
                    title:
                        "Stock insuficiente",
                    text:
                        `El producto ${item.descripcion} supera el stock disponible.`,
                    icon: "warning",
                    confirmButtonColor:
                        "var(--color-primary)",
                });
                return;
            }
        }
        const payload = {
            clienteId:
                clienteId || null,
            tipoMovimientoId:
                Number(tipoMovimientoId),
            observacion,
            usuario,
            detalles:
                detallesSalida.map(
                    (item) => ({
                        productoId:
                            item.productoId,
                        cantidad:
                            Number(
                                item.cantidad
                            ),
                    })
                ),
        };
        await onSave(payload);
    };
    return (

        <div className="ingresos__form-container">
            {/*==========     CABECERA    ========== */}
            <div className="ingresos__form-top-fields">
                <div className="ingresos__item">
                    <h3 className="ingresos__form-title">
                        <span>Fecha : </span>
                        {mode === "new" ?
                            `${fechaActual}`
                            :
                            "Editar Venta"
                        }
                    </h3>
                    <p className="ingresos__form-subtitle">
                        Registro de venta de productos
                    </p>
                </div>
                <div className="ingresos__item">
                    <h3 className="ingresos__form-title">
                        <span>Usuario : </span>{usuario}
                    </h3>
                    <p className="ingresos__form-subtitle">
                        Encargado de Venta
                    </p>
                </div>
                <div className="ingresos__item">
                    <h3 className="ingresos__form-title">
                        <span>Tienda : </span>{tiendaActiva.nombre}
                    </h3>
                    <p className="ingresos__form-subtitle">
                        {tiendaActiva.descripcion}
                    </p>
                </div>
            </div>
            <div className="ingresos__form-client">
                <div className="ingresos__client-nombre">
                    <ClienteSearch
                        label="Nombre del Cliente"
                        clientes={clientes}
                        value={clienteId}
                        onSearch={setClienteId}
                        onRefresh={loadClientes}
                    />
                </div>
                <div className="ingresos__client-pago">
                    <SelectField
                        label="Tipo de movimiento"
                        value={tipoMovimientoId}
                        onChange={(e) =>
                            setTipoMovimientoId(e.target.value)}
                        options={tiposMovimiento}
                        placeholder="Tipo de movimiento"
                    />
                </div>
                <div className="ingresos__client-obs">
                    <Input
                        label="Observación"
                        value={observacion}
                        onChange={(e) =>
                            setObservacion(
                                e.target.value
                            )
                        }
                        placeholder="Observación de la salida..."
                    />
                </div>
            </div>
            {/* ==========  BUSCADOR ============== */}
            <div className="ingresos__details-section">
                <span className="ingresos__section-title">
                    Añadir Productos
                </span>
                <div className="ingresos__search-container">
                    <div className="ingresos__search__item">
                        <SearchInput
                            id="search-producto"
                            name="search-producto"
                            value={productSearch}
                            onChange={setProductSearch}
                            placeholder="Buscar producto..."
                        />
                    </div>
                    <div className="ingresos__search__item">
                        <SelectField
                            value={categoriaFiltroProducto}
                            onChange={(e) =>
                                setCategoriaFiltroProducto(
                                    e.target.value
                                )}
                            options={categorias}
                            placeholder="Categoría"
                        />
                    </div>
                    <div className="ingresos__search__item">
                        <SelectField
                            value={
                                marcaFiltroProducto
                            }
                            onChange={(e) =>
                                setMarcaFiltroProducto(
                                    e.target.value
                                )
                            }
                            options={marcas}
                            placeholder="Marca"
                        />
                    </div>
                    {productosDropdown.length > 0 && (
                        <div className="ingresos__search__dropdown ingresos__dropdown">
                            {productosDropdown.map(
                                (producto) => (
                                    <div
                                        key={producto.id}
                                        className="ingresos__dropdown-item"
                                        onClick={() =>
                                            handleAddProductoSalida(
                                                producto
                                            )
                                        }
                                    >
                                        <span>
                                            <strong>
                                                [{producto.codigo}]
                                            </strong>
                                            {" - "}
                                            {producto.marca?.nombre}
                                            {" - "}
                                            {producto.descripcion}
                                        </span>
                                        <span className="ingresos__dropdown-specs">
                                            Stock:
                                            {" "}
                                            {producto.stockActual}
                                            {" | "}
                                            Color:
                                            {" "}
                                            {producto.color}
                                            {" | "}
                                            Talla:
                                            {" "}
                                            {producto.tallas}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
                {/* =========== TABLA ============ */}
                {detallesSalida.length > 0 ? (
                    <table className="ingresos__temp-table">
                        <thead>
                            <tr>
                                <th>Marca</th>
                                <th>Descripción</th>
                                <th>Código</th>
                                <th>Talla</th>
                                <th>Color</th>
                                <th>Stock</th>
                                <th>Cantidad</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detallesSalida.map(
                                (item, index) => (
                                    <tr
                                        key={item.productoId}
                                    >
                                        <td>
                                            {item.marca}
                                        </td>
                                        <td>
                                            {item.descripcion}
                                        </td>
                                        <td>
                                            <span className="ingresos__code-text">
                                                {item.codigo}
                                            </span>
                                        </td>
                                        <td>
                                            {item.tallas}
                                        </td>
                                        <td>
                                            {item.color}
                                        </td>
                                        <td>
                                            {item.stockActual}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                max={
                                                    item.stockActual
                                                }
                                                className="ingresos__table-input"
                                                value={
                                                    item.cantidad
                                                }
                                                onChange={(e) =>
                                                    handleUpdateCantidad(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="row-actions__button"
                                                title="Eliminar"
                                                onClick={() =>
                                                    handleRemoveDetalle(
                                                        index
                                                    )
                                                }
                                            >
                                                <Trash2
                                                    size={20}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                ) : (
                    <p className="ingresos__empty-text">
                        No existen productos agregados.
                    </p>
                )}
            </div>
            {/* =========== FOOTER ============= */}
            <div className="ingresos__form-footer">
                <span className="ingresos__total-text">
                    Productos seleccionados:
                    <span className="ingresos__total-amount">
                        {" "}
                        {totalProductos}
                    </span>
                </span>
                <div className="ingresos__footer-actions">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Save size={18} />}
                        onClick={handleSubmit}
                    >
                        {mode === "new"
                            ? "Guardar Salida"
                            : "Guardar Cambios"}
                    </Button>
                </div>
            </div>
        </div>

    );
}
export default SalidaForm;