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
import "./Ingresos.css";
import { tipoMovimientosService } from "../../services/tipoMovimientosService";
import { clientesService } from "../../services/clientesService";
import { saveDraft } from "../../stores/draftStorage";
import { ventasService } from "../../services/ventasService";
import VentasSearch from "../../components/VentasSearch/VentasSearch";
import ClienteSearch from "../../components/ClienteSearch/ClienteSearch";
function IngresoForm({
    mode = "new",
    initialData = null,
    draftReady = false,
    onSave,
    onCancel
}) {
    const fechaActual = obtenerFechaBolivia();
    const usuario = useAuthStore((state) => state.usuario.nombre);
    const tiendaActiva = useAuthStore((state) => state.tiendaActiva);
    const DRAFT_KEY = "draft_ingreso";
    // const DRAFT_KEY = `draft_ingreso_${tiendaActiva.id}`;
    const [observacion, setObservacion] = useState(initialData?.observacion || "");
    const [clienteId, setClienteId] = useState(initialData?.clienteId || "");
    const [tipoMovId, setTipoMovId] = useState(initialData?.tipoMovimientoId || "");
    const fechaDelIngreso = obtenerFechaBolivia(initialData?.fecha);
    const [ventaId, setVentaId] = useState(initialData?.venta?.id || "");
    const [productSearch, setProductSearch] = useState("");
    const [clientes, setClientes] = useState([]);
    const [ventas, setVentas] = useState([]);
    const mapDetalles = (detalles = []) => {
        return detalles.map((item) => ({
            productoId:
                item.productoId ??
                item.producto?.id,

            marca:
                item.marca ??
                item.producto?.marca?.nombre ??
                "",

            codigo:
                item.codigo ??
                item.producto?.codigo ??
                "",

            descripcion:
                item.descripcion ??
                item.producto?.descripcion ??
                "",

            tallas:
                item.tallas ??
                item.producto?.tallas ??
                "U",

            color:
                item.color ??
                item.producto?.color ??
                "-",

            cantidad:
                Number(item.cantidad) || 1,

            costoUnitario:
                Number(item.costoUnitario) ||
                Number(item.precioCosto) ||
                0
        }));
    };
    const [movimientoTipos, setMovimientoTipos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categoriaFiltroProducto, setCategoriaFiltroProducto] = useState("");
    const [marcaFiltroProducto, setMarcaFiltroProducto] = useState("");
    const debouncedProductSearch = useDebounce(productSearch, 300);
    const [productosDropdown, setProductosDropdown] = useState([]);

    // const [detallesNuevaCompra, setDetallesNuevaCompra] =
    //     useState(() => {
    //         if (
    //             initialData &&
    //             Array.isArray(initialData.detalles)) {
    //             return initialData.detalles.map((item) => ({
    //                 productoId:
    //                     item.productoId ??
    //                     item.producto?.id,
    //                 marca:
    //                     item.marca ??
    //                     item.producto?.marca?.nombre ??
    //                     "",
    //                 codigo:
    //                     item.codigo ??
    //                     item.producto?.codigo ??
    //                     "",
    //                 descripcion:
    //                     item.descripcion ??
    //                     item.producto?.descripcion ??
    //                     "",
    //                 tallas:
    //                     item.tallas ??
    //                     item.producto?.tallas ??
    //                     "U",
    //                 color:
    //                     item.color ??
    //                     item.producto?.color ??
    //                     "-",
    //                 cantidad:
    //                     Number(item.cantidad) || 1,
    //                 costoUnitario:
    //                     Number(item.costoUnitario) ||
    //                     Number(item.precioCosto) ||
    //                     0
    //             }));
    //         }
    //         return [];
    //     });
    const [detallesNuevaCompra, setDetallesNuevaCompra] =
        useState(() => mapDetalles(initialData?.detalles));

    /*
    ======================================================
    CARGAR DATOS RECIBIDOS (EDIT O DRAFT)
    ======================================================
    */
    useEffect(() => {

        if (!initialData) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClienteId(initialData.clienteId || "");
        setTipoMovId(initialData.tipoMovimientoId || "");
        setVentaId(initialData.ventaId || "");
        setObservacion(initialData.observacion || "");
        setDetallesNuevaCompra(
            mapDetalles(initialData.detalles)
        );

    }, [initialData]);

    /* ======================================================
    CARGA DE CATALOGOS
    ====================================================== */
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
        const loadStaticData = async () => {
            try {
                const [
                    categoriasResponse,
                    marcasResponse,
                    tiposMovResponse,
                    clientesResponse,
                    ventasResponse,
                ] = await Promise.all([
                    categoriasService.getAll(),
                    marcasService.getAll(),
                    tipoMovimientosService.getIngresos(),
                    clientesService.getAll(),
                    ventasService.getAll(),
                ]);
                if (categoriasResponse.success) {
                    setCategorias(
                        categoriasResponse.data.filter(
                            (c) => c.estado
                        )
                    );
                }
                if (marcasResponse.success) {
                    setMarcas(marcasResponse.data);
                }
                if (tiposMovResponse.success) {
                    setMovimientoTipos(tiposMovResponse.data);
                }
                if (clientesResponse.success) {
                    setClientes(clientesResponse.data);
                }
                if (ventasResponse.success) {
                    setVentas(ventasResponse.data);
                }
            } catch (error) {
                console.error(
                    "Error cargando catálogos:",
                    error
                );
            }
        };
        loadStaticData();
    }, []);


    /*
    ======================================================
    BUSCADOR DE PRODUCTOS
    ======================================================
    */
    useEffect(() => {
        const buscarProductosParaLote = async () => {
            if (!debouncedProductSearch) {
                setProductosDropdown([]);
                return;
            }
            try {
                const querySearchParams =
                    new URLSearchParams();
                querySearchParams.append(
                    "page",
                    1
                );
                querySearchParams.append(
                    "search",
                    debouncedProductSearch
                );
                if (categoriaFiltroProducto) {
                    querySearchParams.append(
                        "categoriaId",
                        categoriaFiltroProducto
                    );
                }
                if (marcaFiltroProducto) {
                    querySearchParams.append(
                        "marcaId",
                        marcaFiltroProducto
                    );
                }
                const response =
                    await productosService.getAll(
                        `?${querySearchParams.toString()}`
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
        buscarProductosParaLote();
    }, [
        debouncedProductSearch,
        categoriaFiltroProducto,
        marcaFiltroProducto
    ]);
    /*
    ======================================================
    GUARDADO AUTOMÁTICO DEL BORRADOR
    ======================================================
    */
    useEffect(() => {

        if (mode !== "new") return;

        // Esperar hasta que DraftLoad termine
        if (!draftReady) return;

        const draft = {
            clienteId,
            tipoMovimientoId: tipoMovId,
            ventaId,
            observacion,
            detalles: detallesNuevaCompra
        };

        saveDraft(DRAFT_KEY, draft);

    }, [
        mode,
        draftReady,
        clienteId,
        tipoMovId,
        ventaId,
        observacion,
        detallesNuevaCompra
    ]);
    /*
    ======================================================
    AGREGAR PRODUCTO
    ======================================================
    */
    const handleAddProductToLote = (producto) => {
        console.log("Agregando Prod a la TABLA:", producto);
        const existe = detallesNuevaCompra.some((item) => item.productoId === producto.id);
        if (existe) {
            Swal.fire({
                title: "¡Atención!",
                html:
                    "Producto registrado en la <b>Lista</b>",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)",
                confirmButtonText: "OK"
            });
            return;
        }
        setDetallesNuevaCompra((prev) => [
            {
                productoId: producto.id,
                marca:
                    producto.marca?.nombre,
                codigo:
                    producto.codigo,
                descripcion:
                    producto.descripcion,
                tallas:
                    producto.tallas || "U",
                color:
                    producto.color || "-",
                cantidad: 1,
                costoUnitario:
                    producto.precioCosto || 0
            },
            ...prev
        ]);
        setProductSearch("");
        setProductosDropdown([]);
    };
    /*
    ======================================================
    MODIFICAR FILAS
    ======================================================
    */
    const handleUpdateTempRow = (
        index,
        field,
        value
    ) => {
        setDetallesNuevaCompra((prev) => {
            const copia = [...prev];
            copia[index][field] =
                Number(value);
            return copia;
        });
    };
    const handleRemoveTempRow = (index) => {
        setDetallesNuevaCompra(
            (prev) =>
                prev.filter(
                    (_, i) => i !== index
                )
        );
    };
    /*
    ======================================================
    TOTAL
    ======================================================
    */
    // const costoTotalLote = useMemo(() => {
    //     return detallesNuevaCompra.reduce(
    //         (sum, item) =>
    //             sum +
    //             item.cantidad *
    //             item.costoUnitario,
    //         0
    //     );
    // }, [detallesNuevaCompra]);
    const { costoTotal: costoTotalLote, totalProductos } = useMemo(() => {
        return detallesNuevaCompra.reduce(
            (acumulador, item) => {
                return {
                    costoTotal: acumulador.costoTotal + (item.cantidad * item.costoUnitario),
                    totalProductos: acumulador.totalProductos + item.cantidad
                };
            },
            { costoTotal: 0, totalProductos: 0 }
        );
    }, [detallesNuevaCompra]);
    /*
    ======================================================
    GUARDAR valida antes de guardar muestra alertas con sweetalert2
    ======================================================
    */
    const handleSubmit = async () => {
        let observacionFinal = observacion;
        if (Number(tipoMovId) === 4) {
            observacionFinal = "Devolución de Producto(s).";
        }
        if (!clienteId) {
            Swal.fire({
                title: "Atención",
                text: "Seleccione un cliente.",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)"
            });
            return false;
        }
        if (tipoMovId === "") {
            Swal.fire({
                title: "¡Atención!",
                text:
                    "Debes seleccionar un tipo de movimiento.",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)",
                confirmButtonText: "OK"
            });
            return;
        }
        if (Number(tipoMovId) !== 1 && !ventaId) {
            Swal.fire({
                title: "¡Atención!",
                text: "Debes seleccionar la venta relacionada.",
                icon: "warning",
                confirmButtonColor: "var(--color-primary)",
                confirmButtonText: "OK"
            });
            return;
        }
        if (!observacion.trim() && Number(tipoMovId) === 1) {
            Swal.fire({
                title: "¡Atención!",
                html:
                    "Ingresa una observacion descriptiva.<br /> Glosa general del Ingreso",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)",
                confirmButtonText: "OK"
            });
            return;
        }
        if (detallesNuevaCompra.length === 0) {
            Swal.fire({
                title: "¡Atención!",
                text:
                    "Debes agregar productos al lote de ingreso.",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)",
                confirmButtonText: "OK"
            });
            return;
        }
        const payload = {
            usuario,
            observacion: observacionFinal,
            tipoMovimientoId: Number(tipoMovId),
            clienteId: Number(clienteId),
            ventaId: ventaId ? Number(ventaId) : 0,
            total: costoTotalLote,
            detalles:
                detallesNuevaCompra
        };
        await onSave(payload);
    };
    return (
        <div className="ingresos__form-container">
            {/* Campos de Cabecera del Documento */}
            <div className="ingresos__form-top-fields">
                <div className="ingresos__item">
                    <h3 className="ingresos__form-title">
                        <span>Fecha : </span>
                        {mode === "new" ? `${fechaActual}` : `${fechaDelIngreso}`}
                    </h3>
                    <p className="ingresos__form-subtitle">
                        Registro de ingreso de productos
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
                        label="Tipo Movimiento"
                        value={tipoMovId}
                        onChange={(e) => {
                            const tipo = Number(e.target.value);
                            setTipoMovId(tipo);
                            if (tipo === 1) { // El codigo 1 = INGRESO en la BD donde estan los Tipos de Movimiento
                                setVentaId("");
                            }
                        }}
                        options={movimientoTipos}
                        placeholder="Seleccione"
                    />
                </div>
                {Number(tipoMovId) === 1 &&
                    (
                        <div className="ingresos__client-obs">
                            <Input
                                label="Observación / Glosa general:"
                                value={observacion}
                                onChange={(e) =>
                                    setObservacion(e.target.value)
                                }
                                placeholder="Ej: Lote Campaña Verano viaje a Brasil"
                            />
                        </div>
                    )}
                {Number(tipoMovId) !== 1 &&
                    (
                        <div className="ingresos__client-obs">
                            <VentasSearch
                                label="Venta Relacionada"
                                id="ventaId"
                                ventas={ventas}
                                value={ventaId}
                                onSearch={setVentaId}
                            />
                        </div>
                    )}
            </div>
            {/* ===    BUSCADOR     ========= */}
            <div className="ingresos__details-section">
                <span className="ingresos__section-title">
                    Añadir Productos al Detalle:
                </span>
                <div className="ingresos__search-container">
                    <div className="ingresos__search__item">
                        <SearchInput
                            id="add-product-search"
                            name="add-product-search"
                            value={productSearch}
                            onChange={setProductSearch}
                            placeholder="Escribe el código o descripción del artículo para jalar sus datos..."
                        />
                    </div>
                    <div className="ingresos__search__item">
                        <SelectField
                            value={categoriaFiltroProducto}
                            onChange={(e) =>
                                setCategoriaFiltroProducto(
                                    e.target.value
                                )
                            }
                            options={categorias}
                            placeholder="Categoría"
                        />
                    </div>
                    <div className="ingresos__search__item">
                        <SelectField
                            value={marcaFiltroProducto}
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
                            {productosDropdown.map((prod) => (
                                <div
                                    key={prod.id}
                                    onClick={() => handleAddProductToLote(prod)}
                                    className="ingresos__dropdown-item"
                                >
                                    <span>
                                        <strong>
                                            [{prod.codigo}]
                                        </strong>
                                        {" - "}
                                        {prod.marca?.nombre}
                                        {" - "}
                                        {prod.descripcion}
                                    </span>
                                    <span className="ingresos__dropdown-specs">
                                        Stock: {prod.stockActual}
                                        {" | "}
                                        Color: {prod.color}
                                        {" | "}
                                        Talla: {prod.tallas}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* =======================================================
                            TABLA TEMPORAL
                        ======================================================= */}
                {detallesNuevaCompra.length > 0 ? (
                    <table className="ingresos__temp-table">
                        <thead>
                            <tr>
                                <th>Marca</th>
                                <th>Descripción</th>
                                <th>Código</th>
                                <th className="align-right">
                                    Talla
                                </th>
                                <th>/ Color</th>
                                <th>Cantidad</th>
                                <th>
                                    Costo U. (Bs)
                                </th>
                                <th>Subtotal</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detallesNuevaCompra.map(
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
                                        <td className="align-right">
                                            {item.tallas}
                                        </td>
                                        <td>
                                            / {item.color}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                className="ingresos__table-input"
                                                value={item.cantidad}
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) =>
                                                    handleUpdateTempRow(
                                                        index,
                                                        "cantidad",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                // step="0.1"
                                                className="ingresos__table-input"
                                                value={item.costoUnitario}
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) =>
                                                    handleUpdateTempRow(
                                                        index,
                                                        "costoUnitario",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <strong>
                                                Bs{" "}
                                                {(item.cantidad * item.costoUnitario).toFixed(2)}
                                            </strong>
                                        </td>
                                        <td>
                                            <button
                                                className="row-actions__button"
                                                title="Borrar"
                                                onClick={() =>
                                                    handleRemoveTempRow(index)
                                                }
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                ) : (
                    <p className="ingresos__empty-text">
                        No has añadido ningún producto al lote todavía.
                        Usa el buscador de arriba.
                    </p>
                )}
            </div>
            {/* =====   FOOTER    =============== */}
            <div className="ingresos__form-footer">
                <span className="ingresos__total-text">
                    Items:
                    <span className="ingresos__total-amount">
                        {" "}
                        {totalProductos} ud.
                    </span>
                    {" => "}Inversión:
                    <span className="ingresos__total-amount">
                        {" "}
                        {costoTotalLote.toFixed(2)} Bs.
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
                            ? "Guardar Ingreso"
                            : "Guardar Cambios"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
export default IngresoForm;