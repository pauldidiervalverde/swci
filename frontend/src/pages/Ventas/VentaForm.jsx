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
import { categoriasService } from "../../services/categoriasService";
import { marcasService } from "../../services/marcasService";
import { productosService } from "../../services/productosService";
import { clientesService } from "../../services/clientesService";
import { tipoPagoService } from "../../services/tipoPagoService";
import "../Ingresos/Ingresos.css";
import ClienteSearch from "../../components/ClienteSearch/ClienteSearch";
function VentaForm({
    mode = "new",
    initialData = null,
    onSave,
    onCancel,
}) {
    ////////////////////////////////////////////////////////////
    // DATOS GENERALES
    ////////////////////////////////////////////////////////////
    const fechaActual = obtenerFechaBolivia();
    const usuario = useAuthStore(
        (state) => state.usuario.nombre
    );
    const tiendaActiva = useAuthStore(
        (state) => state.tiendaActiva
    );
    ////////////////////////////////////////////////////////////
    // CABECERA
    ////////////////////////////////////////////////////////////
    const [clienteId, setClienteId] = useState(
        initialData?.clienteId || ""
    );
    const [tipoPagoId, setTipoPagoId] = useState(
        initialData?.tipoPagoId || ""
    );
    const [observacion, setObservacion] = useState(
        initialData?.observacion || ""
    );
    const fechaDelIngreso = obtenerFechaBolivia(initialData?.fecha);
    ////////////////////////////////////////////////////////////
    // CATÁLOGOS
    ////////////////////////////////////////////////////////////
    const [clientes, setClientes] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);
    ////////////////////////////////////////////////////////////
    // BUSCADOR
    ////////////////////////////////////////////////////////////
    const [productSearch, setProductSearch] =
        useState("");
    const debouncedProductSearch =
        useDebounce(productSearch, 300);
    const [productosDropdown, setProductosDropdown] =
        useState([]);
    ////////////////////////////////////////////////////////////
    // FILTROS
    ////////////////////////////////////////////////////////////
    const [categoriaFiltroProducto,
        setCategoriaFiltroProducto] =
        useState("");
    const [marcaFiltroProducto,
        setMarcaFiltroProducto] =
        useState("");
    const [categorias, setCategorias] =
        useState([]);
    const [marcas, setMarcas] =
        useState([]);
    ////////////////////////////////////////////////////////////
    // DETALLE DE LA VENTA
    ////////////////////////////////////////////////////////////
    const [detallesVenta,
        setDetallesVenta] = useState(() => {
            if (
                initialData &&
                Array.isArray(initialData.detalles)
            ) {
                return initialData.detalles.map((item) => ({
                    productoId:
                        item.productoId,
                    marca:
                        item.producto?.marca?.nombre || "",
                    codigo:
                        item.producto?.codigo || "",
                    descripcion:
                        item.producto?.descripcion || "",
                    color:
                        item.producto?.color || "-",
                    tallas:
                        item.producto?.tallas || "U",
                    stock:
                        item.producto?.stockActual || 0,
                    cantidad:
                        Number(item.cantidad),
                    precioLista:
                        Number(item.precioLista),
                    descuento:
                        Number(item.descuento),
                    precioUnitario:
                        Number(item.precioUnitario),
                    subtotal:
                        Number(item.subtotal)
                }));
            }
            return [];
        });
    ////////////////////////////////////////////////////////////
    // CARGAR CATÁLOGOS
    ////////////////////////////////////////////////////////////
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
        const cargarCatalogos = async () => {
            try {
                const [
                    clientesResponse,
                    tipoPagoResponse,
                    categoriasResponse,
                    marcasResponse
                ] = await Promise.all([
                    clientesService.getAll(),
                    tipoPagoService.getAll(),
                    categoriasService.getAll(),
                    marcasService.getAll()
                ]);
                if (clientesResponse.success) {
                    setClientes(
                        clientesResponse.data
                    );
                }
                if (tipoPagoResponse.success) {
                    setTiposPago(
                        tipoPagoResponse.data
                    );
                }
                if (categoriasResponse.success) {
                    setCategorias(
                        categoriasResponse.data.filter(
                            c => c.estado
                        )
                    );
                }
                if (marcasResponse.success) {
                    setMarcas(
                        marcasResponse.data
                    );
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        cargarCatalogos();
    }, []);
    ////////////////////////////////////////////////////////////
    // BUSCADOR DE PRODUCTOS
    ////////////////////////////////////////////////////////////
    useEffect(() => {
        const buscarProductos = async () => {
            if (!debouncedProductSearch.trim()) {
                setProductosDropdown([]);
                return;
            }
            try {
                const params = new URLSearchParams();
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
                    // 1. Extraemos los productos usando la misma lógica de respaldo que ya tenías
                    const productosObtenidos = response.data?.data || response.data || [];

                    // 2. Los ordenamos por 'stockActual' (de mayor a menor en este ejemplo)
                    const productosOrdenados = [...productosObtenidos].sort((a, b) => {
                        // Si el stock viene como string, lo convertimos a número con Number() o parseFloat()
                        const stockA = Number(a.stockActual) || 0;
                        const stockB = Number(b.stockActual) || 0;

                        return stockB - stockA; // De Mayor a Menor. (Usa 'stockA - stockB' si quieres de Menor a Mayor)
                    });

                    // 3. Guardamos la lista ya ordenada en el dropdown
                    setProductosDropdown(productosOrdenados);
                }
            } catch (error) {
                console.error(
                    "Error buscando productos",
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
    ////////////////////////////////////////////////////////////
    // AGREGAR PRODUCTO
    ////////////////////////////////////////////////////////////
    const handleAddProducto = (producto) => {
        const existe =
            detallesVenta.some(
                item =>
                    item.productoId ===
                    producto.id
            );
        if (existe) {
            Swal.fire({
                title: "Producto duplicado",
                text:
                    "Este producto ya fue agregado.",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)"
            });
            return;
        }
        setDetallesVenta(prev => [
            ...prev,
            {
                productoId:
                    producto.id,
                marca:
                    producto.marca?.nombre ||
                    "",
                codigo:
                    producto.codigo,
                descripcion:
                    producto.descripcion,
                color:
                    producto.color ||
                    "-",
                tallas:
                    producto.tallas ||
                    "U",
                stock:
                    producto.stockActual,
                cantidad: 1,
                precioLista:
                    Number(
                        producto.precioVenta
                    ),
                descuento: 0,
                precioUnitario:
                    Number(
                        producto.precioVenta
                    ),
                subtotal:
                    Number(
                        producto.precioVenta
                    )
            }
        ]);
        setProductSearch("");
        setProductosDropdown([]);
    };
    ////////////////////////////////////////////////////////////
    // ACTUALIZAR FILA
    ////////////////////////////////////////////////////////////
    const handleUpdateRow = (
        index,
        field,
        value
    ) => {
        setDetallesVenta(prev => {
            const copia = [...prev];
            let fila = {
                ...copia[index]
            };
            if (
                field === "cantidad"
            ) {
                let cantidad =
                    Number(value);
                if (
                    cantidad <= 0
                ) {
                    cantidad = 1;
                }
                if (
                    cantidad >
                    fila.stock
                ) {
                    Swal.fire({
                        title:
                            "Stock insuficiente",
                        text:
                            `Solo existen ${fila.stock} unidades disponibles.`,
                        icon:
                            "warning",
                        confirmButtonColor:
                            "var(--color-primary)"
                    });
                    cantidad =
                        fila.stock;
                }
                fila.cantidad =
                    cantidad;
            }
            if (
                field === "precioLista"
            ) {
                fila.precioLista =
                    Number(value);
            }
            if (
                field === "descuento"
            ) {
                let descuento =
                    Number(value);
                if (
                    descuento <
                    0
                ) {
                    descuento = 0;
                }
                fila.descuento =
                    descuento;
            }
            fila.precioUnitario =
                fila.precioLista -
                fila.descuento;
            if (
                fila.precioUnitario <
                0
            ) {
                fila.precioUnitario =
                    0;
            }
            fila.subtotal =
                fila.cantidad *
                fila.precioUnitario;
            copia[index] = fila;
            return copia;
        });
    };
    ////////////////////////////////////////////////////////////
    // ELIMINAR FILA
    ////////////////////////////////////////////////////////////
    const handleDeleteRow = (
        index
    ) => {
        setDetallesVenta(prev =>
            prev.filter(
                (_, i) =>
                    i !== index
            )
        );
    };
    ////////////////////////////////////////////////////////////
    // TOTAL GENERAL
    ////////////////////////////////////////////////////////////
    const totalVenta =
        useMemo(() => {
            return detallesVenta.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.subtotal,
                0
            );
        }, [
            detallesVenta
        ]);
    ////////////////////////////////////////////////////////////
    // VALIDACIONES
    ////////////////////////////////////////////////////////////
    const validarFormulario = () => {
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
        if (!tipoPagoId) {
            Swal.fire({
                title: "Atención",
                text: "Seleccione un tipo de pago.",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)"
            });
            return false;
        }
        if (detallesVenta.length === 0) {
            Swal.fire({
                title: "Atención",
                text:
                    "Debe agregar al menos un producto.",
                icon: "warning",
                confirmButtonColor:
                    "var(--color-primary)"
            });
            return false;
        }
        for (const item of detallesVenta) {
            if (item.cantidad <= 0) {
                Swal.fire({
                    title: "Cantidad inválida",
                    text:
                        `${item.descripcion}`,
                    icon: "warning",
                    confirmButtonColor:
                        "var(--color-primary)"
                });
                return false;
            }
            if (
                item.cantidad >
                item.stock
            ) {
                Swal.fire({
                    title: "Stock insuficiente",
                    html:
                        `<b>${item.descripcion}</b><br/>
                        Solo existen ${item.stock} unidades.`,
                    icon: "warning",
                    confirmButtonColor:
                        "var(--color-primary)"
                });
                return false;
            }
        }
        return true;
    };
    ////////////////////////////////////////////////////////////
    // GUARDAR
    ////////////////////////////////////////////////////////////
    const handleSubmit = async () => {
        if (!validarFormulario()) {
            return;
        }
        const payload = {
            clienteId: Number(clienteId),
            tipoPagoId: Number(tipoPagoId),
            observacion,
            usuario,
            total: Number(totalVenta.toFixed(2)),
            detalles:
                detallesVenta.map(item => ({
                    productoId:
                        item.productoId,
                    cantidad:
                        Number(
                            item.cantidad
                        ),
                    precioLista:
                        Number(
                            item.precioLista
                        ),
                    descuento:
                        Number(
                            item.descuento
                        ),
                    precioUnitario:
                        Number(
                            item.precioUnitario
                        ),
                    subtotal:
                        Number(
                            item.subtotal
                        )
                }))
        };
        await onSave(payload);
    };
    ////////////////////////////////////////////////////////////
    // RETURN
    ////////////////////////////////////////////////////////////
    return (

        <div className="ingresos__form-container">

            <div className="ingresos__form-top-fields">
                <div className="ingresos__item">
                    <h3 className="ingresos__form-title">
                        <span>Fecha : </span>
                        {mode === "new" ?
                            `${fechaActual}`
                            :
                            `${fechaDelIngreso}`
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
                        label="Tipo de Pago"
                        value={tipoPagoId}
                        onChange={(e) =>
                            setTipoPagoId(e.target.value)}
                        options={tiposPago}
                        placeholder="Seleccione"
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
                        placeholder="Detalle de la venta"
                    />
                </div>
            </div>

            {/* AQUÍ COMIENZA EL BUSCADOR */}
            <div className="ingresos__details-section">
                <span className="ingresos__section-title">
                    Añadir Productos al Detalle:
                </span>
                <div className="ingresos__search-container">
                    <div className="ingresos__search__item">
                        <SearchInput
                            id="buscar-producto"
                            name="buscar-producto"
                            value={productSearch}
                            onChange={setProductSearch}
                            placeholder="Buscar por código o descripción..."
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
                            {productosDropdown.map(prod => (
                                <div
                                    key={prod.id}
                                    className="ingresos__dropdown-item"
                                    onClick={() => handleAddProducto(prod)}
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
                                        Stock:
                                        {" "}
                                        {prod.stockActual}
                                        {" | "}
                                        {prod.color}
                                        {" | "}
                                        {prod.tallas}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {detallesVenta.length > 0
                ?
                <table
                    className="ingresos__temp-table"
                >
                    <thead>
                        <tr>
                            <th>Marca</th>
                            <th>Descripción</th>
                            <th>Código</th>
                            <th>Talla</th>
                            <th>Color</th>
                            <th>Stock</th>
                            <th>Cantidad</th>
                            <th>Precio Lista</th>
                            <th>Desc.</th>
                            <th>Precio Final</th>
                            <th>Subtotal</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            detallesVenta.map(
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
                                            {item.codigo}
                                        </td>
                                        <td>
                                            {item.tallas}
                                        </td>
                                        <td>
                                            {item.color}
                                        </td>
                                        <td>
                                            <strong>
                                                {item.stock}
                                            </strong>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                className="ingresos__table-input"
                                                value={item.cantidad}
                                                onChange={(e) =>
                                                    handleUpdateRow(
                                                        index,
                                                        "cantidad",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <strong>
                                                {item.precioLista}
                                            </strong>
                                            {/* <input
                                                type="number"
                                                step="0.01"
                                                className="ingresos__table-input"
                                                value={item.precioLista}
                                                onChange={(e) =>
                                                    handleUpdateRow(
                                                        index,
                                                        "precioLista",
                                                        e.target.value
                                                    )
                                                }
                                            /> */}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="ingresos__table-input"
                                                value={item.descuento}
                                                onChange={(e) =>
                                                    handleUpdateRow(
                                                        index,
                                                        "descuento",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <strong>
                                                Bs {
                                                    item.precioUnitario.toFixed(2)
                                                }
                                            </strong>
                                        </td>
                                        <td>
                                            <strong>
                                                Bs {
                                                    item.subtotal.toFixed(2)
                                                }
                                            </strong>
                                        </td>
                                        <td>
                                            <button
                                                className="row-actions__button"
                                                onClick={() =>
                                                    handleDeleteRow(index)
                                                }
                                            >
                                                <Trash2
                                                    size={20}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
                :
                <p className="ingresos__empty-text">
                    No existen productos agregados.
                </p>
            }
            <div className="ingresos__form-footer">
                <span className="ingresos__total-text">
                    Total Venta
                    <span
                        className="ingresos__total-amount"
                    >
                        {" "}
                        Bs {totalVenta.toFixed(2)}
                    </span>
                </span>


                <div className="ingresos__footer-actions">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    {fechaActual === fechaDelIngreso
                        ?
                        <Button
                            variant="primary"
                            icon={<Save size={18} />}
                            onClick={handleSubmit}
                        >
                            {mode === "new" ?
                                "Guardar Venta" :
                                "Guardar Cambios"
                            }
                        </Button>
                        : ""
                    }
                </div>

            </div>
        </div>

    );
}
export default VentaForm;
