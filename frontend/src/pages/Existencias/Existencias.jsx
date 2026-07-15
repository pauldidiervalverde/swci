import { useEffect, useState, useMemo, useCallback } from "react";
import PageHeader from "../../components/PageHeader/PageHeader";
import DataTable from "../../components/DataTable/DataTable";
import ProductosSearch from "../../components/ProductosSearch/ProductosSearch";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import { productosService } from "../../services/productosService";
import { categoriasService } from "../../services/categoriasService";
import { marcasService } from "../../services/marcasService";
import { ingresosService } from "../../services/ingresosService"; // 🌟 Importamos el servicio de ingresos
import { Package, AlertTriangle, Activity, Shirt } from "lucide-react";
import "./Existencias.css";
import { obtenerFechaBolivia } from "../../utils/normalizarHora";
import SelectField from "../../components/SelectField/SelectField";

function Existencias() {
    const [loading, setLoading] = useState(true);
    const [loadingLote, setLoadingLote] = useState(false);
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);

    // 🌟 NUEVOS ESTADOS PARA LOTES
    const [searchMode, setSearchMode] = useState("producto"); // "producto" | "lote"
    const [lotes, setLotes] = useState([]);
    const [selectedLoteId, setSelectedLoteId] = useState("");

    // Carga de datos inicial
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [
                    productosResponse,
                    categoriasResponse,
                    marcasResponse,
                    ingresosResponse // 🌟 Traemos los ingresos/lotes generales
                ] = await Promise.all([
                    productosService.getAll(),
                    categoriasService.getAll(),
                    marcasService.getAll(),
                    ingresosService.getAll()
                ]);

                if (productosResponse.success) {
                    const data = productosResponse.data.data || [];
                    setProductos(data);
                    //setProductosFiltrados(data);
                }
                if (categoriasResponse.success) {
                    setCategorias(categoriasResponse.data.filter((item) => item.estado));
                }
                if (marcasResponse.success) {
                    setMarcas(marcasResponse.data.filter((item) => item.estado));
                }
                if (ingresosResponse.success) {
                    setLotes(ingresosResponse.data || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 🌟 MANEJADOR DE CAMBIO DE MODO DE BÚSQUEDA
    const handleModeChange = (mode) => {
        setSearchMode(mode);
        setSelectedLoteId(""); // Limpiar select de lotes

        if (mode === "producto") {
            // Volvemos al estado completo de productos
            setProductosFiltrados([]);
        } else {
            // Modo lote: Limpiamos la tabla inmediatamente hasta que escoja un lote
            setProductosFiltrados([]);
        }
    };

    // Mapeamos los lotes para adaptarlos al { id, nombre } que exige tu SelectField
    const loteOptions = useMemo(() => {
        return lotes.map((lote) => {
            const fechaFormateada = obtenerFechaBolivia(lote.fecha);
            const descripcion = lote.observacion ? ` — ${lote.observacion}` : " — Sin observación";

            return {
                id: lote.id,
                // Esto es lo que se renderizará en el botón y la lista desplegable
                nombre: `${lote.codigo}${descripcion} (${fechaFormateada})`
            };
        });
    }, [lotes]);

    // 🌟 CAPTURA Y ADAPTACIÓN DE PRODUCTOS POR LOTE
    const handleLoteChange = async (e) => {
        const loteId = e.target.value;
        setSelectedLoteId(loteId);

        if (!loteId) {
            setProductosFiltrados([]);
            return;
        }

        try {
            setLoadingLote(true);
            const response = await ingresosService.getById(loteId);

            if (response.success && response.data?.detalles) {
                const detallesLote = response.data.detalles;

                // Buscamos e igualamos contra nuestra lista maestra de productos en memoria
                const productosDelLote = detallesLote.map((detalle) => {
                    const productoMaestro = productos.find((p) => p.id === detalle.productoId);

                    // Si existe en nuestra lista general, usamos ese objeto con su stockActual al día
                    if (productoMaestro) {
                        return productoMaestro;
                    }

                    // Fallback en caso de que un producto viejo no se encuentre en la lista activa
                    return {
                        ...detalle.producto,
                        precioVenta: detalle.producto.precioVenta || "0"
                    };
                });

                setProductosFiltrados(productosDelLote);
            }
        } catch (error) {
            console.error("Error al cargar el detalle del lote:", error);
            setProductosFiltrados([]);
        } finally {
            setLoadingLote(false);
        }
    };

    // Métricas calculadas en base a lo que muestra la tabla
    const metrics = useMemo(() => {
        let totalItems = 0;
        let valorTotal = 0;
        let productosConStock = 0;
        let alertasMinimas = 0;
        let agotados = 0;

        productosFiltrados.forEach((p) => {
            const stock = Number(p.stockActual) || 0;
            const min = Number(p.stockMinimo) || 0;
            const precio = Number(p.precioVenta) || 0;

            totalItems += stock;
            valorTotal += stock * precio;

            if (stock === 0) {
                agotados++;
            } else if (stock <= min) {
                alertasMinimas++;
            }
            if (stock > 0) {
                productosConStock++;
            }
        });

        return { totalItems, valorTotal, productosConStock, alertasMinimas, agotados };
    }, [productosFiltrados]);

    const columns = [
        { key: "codigo", label: "Cod", showDesktop: true, showTablet: true, showMobile: false },
        { key: "marca", label: "Marca", showDesktop: true, showTablet: false, showMobile: false, render: (row) => row.marca?.nombre },
        { key: "descripcion", label: "Descripcion", isPrimary: true, showDesktop: true, showTablet: true, showMobile: true },
        { key: "precioVenta", label: "Precio", showDesktop: true, showTablet: false, showMobile: false, render: (row) => `Bs ${row.precioVenta}` },
        { key: "tallas", label: "Talla", alignClass: "text-right text-soft", showDesktop: true, showTablet: false, showMobile: false },
        { key: "color", label: "Color", showDesktop: true, showTablet: true, showMobile: true },
        { key: "stockActual", label: "Stock", alignClass: "text-center", showDesktop: true, showTablet: true, showMobile: true },
    ];

    // Evitar renderizados en cascada de componentes hijo
    const handleFilter = useCallback((resultados) => {
        setProductosFiltrados(() => resultados);
    }, []);

    return (
        <div className="page-container">
            <PageHeader
                title="Existencias"
                subtitle="Consulta del inventario disponible"
            />

            <div className="existencias__cards-grid">
                <DashboardCard title="Total Unidades Stock" value={metrics.totalItems.toLocaleString()} icon={Package} suffix=" unidades" />
                <DashboardCard title="Productos con Stock" value={metrics.productosConStock.toLocaleString()} icon={Shirt} suffix=" items" />
                <DashboardCard title="Alertas de Stock Mínimo" value={metrics.alertasMinimas} icon={Activity} status={metrics.alertasMinimas > 0 ? "warning" : "normal"} />
                <DashboardCard title="Productos Agotados" value={metrics.agotados} icon={AlertTriangle} status={metrics.agotados > 0 ? "danger" : "normal"} />
            </div>

            {/* 🌟 SELECTOR DE MODO DE BÚSQUEDA (TABS MINIMALISTAS MODERNOS) */}
            <div className="existencias__modes-container">
                <button
                    className={`existencias__mode-btn ${searchMode === "producto" ? "existencias__mode-btn--active" : ""}`}
                    onClick={() => handleModeChange("producto")}
                >
                    BUSCAR POR PRODUCTO
                </button>
                <button
                    className={`existencias__mode-btn ${searchMode === "lote" ? "existencias__mode-btn--active" : ""}`}
                    onClick={() => handleModeChange("lote")}
                >
                    BUSCAR POR LOTE
                </button>
            </div>

            {/* 🌟 CONTROL DINÁMICO DE FILTROS SEGÚN EL MODO */}
            <div className="existencias__filters">
                {searchMode === "producto" ? (
                    <ProductosSearch
                        productos={productos}
                        categorias={categorias}
                        marcas={marcas}
                        onFilter={handleFilter}
                        orderBy="stockActual"
                        desc={true}
                    //filterRequired={true} // 🌟 ¡Aquí activas la restricción!
                    />
                ) : (
                    /* 🌟 Integramos tu componente personalizado */
                    <div className="existencias__lote-selector-wrapper">
                        <SelectField
                            id="loteSelector"
                            name="loteSelector"
                            placeholder="Seleccione un lote de ingreso..."
                            options={loteOptions}        /* Pasamos las opciones ya formateadas */
                            value={selectedLoteId}
                            onChange={(e) => {
                                // Reutilizamos tu lógica pasándole el id seleccionado
                                handleLoteChange({ target: { value: e.target.value } });
                            }}
                        />
                    </div>
                )}
            </div>

            <DataTable
                columns={columns}
                data={productosFiltrados}
                listItem={searchMode === "lote"} /* 🌟 Si es modo lote, activa el modo lista (sin paginación) */
                emptyMessage={
                    loading || loadingLote
                        ? "Cargando datos..."
                        : searchMode === "producto" && productosFiltrados.length === 0
                            ? "Por favor, use los filtros superiores para buscar productos"
                            : searchMode === "lote" && !selectedLoteId
                                ? "Por favor, seleccione un lote para verificar sus productos"
                                : "No se encontraron productos coincidentes"
                }
            />
        </div>
    );
}

export default Existencias;