import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Upload } from "lucide-react";
import PageHeader from "../../components/PageHeader/PageHeader";
import SearchInput from "../../components/SearchInput/SearchInput";
import DataTable from "../../components/DataTable/DataTable";
import Button from "../../components/Button/Button";
import RowActions from "../../components/RowActions/RowActions";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { useDebounce } from "../../hooks/useDebounce";
import ProductoModal from "./ProductoModal";
import ProductoPanel from "./ProductoPanel";
import { productosService } from "../../services/productosService";
import { categoriasService } from "../../services/categoriasService";
import { marcasService } from "../../services/marcasService";
import "./Productos.css";
import SelectField from "../../components/SelectField/SelectField";
import ProductImportModal from "../Imports/ProductImportModal";

function Productos() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);

    // --- ESTADOS DE FILTROS ---
    const [categoriaFiltro, setCategoriaFiltro] = useState("");
    const [marcaFiltro, setMarcaFiltro] = useState("");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    // --- ESTADOS DE PAGINACIÓN (API DE 100 EN 100) ---
    const [serverPage, setServerPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE MODALES / INTERFAZ ---
    const [showPanel, setShowPanel] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [productoEstado, setProductoEstado] = useState(null);

    // --- SOLUCIÓN AL RENDERIZADO EN CASCADA ---
    // Guardamos las referencias anteriores de los filtros para comparar en caliente
    const [prevFiltros, setPrevFiltros] = useState({
        search: debouncedSearch,
        categoria: categoriaFiltro,
        marca: marcaFiltro
    });

    // Si cualquiera de los filtros cambió con respecto al render anterior,
    // actualizamos el espejo y mandamos la página al bloque 1 inmediatamente.
    if (
        debouncedSearch !== prevFiltros.search ||
        categoriaFiltro !== prevFiltros.categoria ||
        marcaFiltro !== prevFiltros.marca
    ) {
        setPrevFiltros({
            search: debouncedSearch,
            categoria: categoriaFiltro,
            marca: marcaFiltro
        });
        setServerPage(1);
    }

    // 1. Cargar Datos Estáticos (Categorías y Marcas) Solo al iniciar


    // 2. Cargar los 100 productos correspondientes del Servidor
    const fetchProductosDelServidor = useCallback(async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams();
            queryParams.append("page", serverPage);
            if (debouncedSearch) queryParams.append("search", debouncedSearch);
            if (categoriaFiltro) queryParams.append("categoriaId", categoriaFiltro);
            if (marcaFiltro) queryParams.append("marcaId", marcaFiltro);

            const response = await productosService.getAll(`?${queryParams.toString()}`);

            if (response.success) {
                setProductos(response.data?.data || response.data);
                setTotalRecords(response.data?.total || 0);
            }
        } catch (error) {
            console.error("Error trayendo productos del servidor:", error);
        } finally {
            setLoading(false);
        }
    }, [serverPage, debouncedSearch, categoriaFiltro, marcaFiltro]);

    useEffect(() => {
        const loadStaticData = async () => {
            try {
                const [categoriasResponse, marcasResponse] = await Promise.all([
                    categoriasService.getAll(),
                    marcasService.getAll(),
                ]);
                if (categoriasResponse.success) {
                    setCategorias(categoriasResponse.data.filter((item) => item.estado));
                }
                if (marcasResponse.success) {
                    setMarcas(marcasResponse.data);
                }
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            }
        };
        loadStaticData();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProductosDelServidor();
    }, [fetchProductosDelServidor]);

    // --- SE ELIMINÓ EL USEEFFECT PROBLEMÁTICO QUE ESTABA AQUÍ ---

    // ... Resto de tus funciones (handleNew, handleEdit, etc.) y return JSX


    const categoriaSeleccionadaNombre = useMemo(() => {
        const cat = categorias.find(c => String(c.id) === String(categoriaFiltro));
        return cat ? cat.nombre : "";
    }, [categoriaFiltro, categorias]);

    const handleNew = () => {
        // Limpieza controlada preventivo-secuencial
        setSearch("");
        setMarcaFiltro("");
        setSelectedProducto(null);

        if (window.innerWidth < 1024) {
            setModalOpen(true);
            return;
        }
        setShowPanel(true);
    };

    const handleCargaMasiva = () => {
        setSearch("");
        setMarcaFiltro("");
        setImportModalOpen(true);
    };

    const handleEdit = async (row) => {
        try {
            const response = await productosService.getById(row.id);
            if (response.success) {
                setSelectedProducto(response.data);
                if (window.innerWidth < 1024) {
                    setModalOpen(true);
                } else {
                    setShowPanel(true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (data) => {
        try {
            if (selectedProducto) {
                await productosService.update(selectedProducto.id, data);
            } else {
                await productosService.create(data);
            }
            setShowPanel(false);
            setModalOpen(false);
            setSelectedProducto(null);

            // Forzamos ir a la página 1 para ver los cambios de inmediato
            setServerPage(1);
            await fetchProductosDelServidor();
        } catch (error) {
            alert(error?.response?.data?.message || "Error al guardar");
        }
    };

    const handleToggleStatus = (row) => {
        setProductoEstado(row);
        setConfirmOpen(true);
    };

    const confirmStatusChange = async () => {
        try {
            await productosService.changeStatus(productoEstado.id, !productoEstado.estado);
            setConfirmOpen(false);
            setProductoEstado(null);
            await fetchProductosDelServidor();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        { key: "codigo", label: "Cod", showDesktop: true, showTablet: false, showMobile: false },
        { key: "categoria", label: "Categoría", showDesktop: true, showTablet: false, showMobile: false, render: (row) => row.categoria?.nombre },
        { key: "marca", label: "Marca", showDesktop: true, showTablet: false, showMobile: false, render: (row) => row.marca?.nombre },
        { key: "descripcion", label: "Descripcion", isPrimary: true, showDesktop: true, showTablet: true, showMobile: true },
        { key: "precioVenta", label: "Precio", showDesktop: true, showTablet: false, showMobile: false, render: (row) => `Bs ${row.precioVenta}` },
        { key: "tallas", label: "Talla", alignClass: "text-right", showDesktop: true, showTablet: false, showMobile: false },
        { key: "color", label: "Color", showDesktop: true, showTablet: true, showMobile: false },
        {
            key: "acciones",
            label: "Acciones",
            showDesktop: true,
            showTablet: true,
            showMobile: true,
            render: (row) => (
                <RowActions row={row} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
            ),
        },
    ];

    return (
        <div className="page-container">
            <PageHeader title="Productos" subtitle="Administración de productos" />

            <div className="productos__filters">
                <div className="productos__item">
                    <SearchInput
                        id="producto-search"
                        name="producto-search"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar producto..."
                    />
                </div>
                <div className="productos__item">
                    <SelectField
                        id="categoria-filtro"
                        name="categoria-filtro"
                        value={categoriaFiltro}
                        onChange={(e) => setCategoriaFiltro(e.target.value)}
                        options={categorias}
                        placeholder="Todas las categorías"
                    />
                </div>
                <div className="productos__item">
                    <SelectField
                        id="marca-filtro"
                        name="marca-filtro"
                        value={marcaFiltro}
                        onChange={(e) => setMarcaFiltro(e.target.value)}
                        options={marcas}
                        placeholder="Todas las marcas"
                    />
                </div>
                <div className="productos__item productos__actions">
                    <Button variant="primary" icon={<Plus size={18} />} onClick={handleNew} disabled={!categoriaFiltro}>
                        Producto
                    </Button>
                    <Button variant="success" icon={<Upload size={18} />} onClick={handleCargaMasiva} disabled={!categoriaFiltro}>
                        Carga
                    </Button>
                </div>
            </div>

            <div className={`productos__panel-wrapper ${showPanel ? "productos__panel-wrapper--open" : ""}`}>
                {showPanel && (
                    <ProductoPanel
                        producto={selectedProducto}
                        productos={productos}
                        categoriaInicial={categoriaFiltro}
                        onSave={handleSave}
                        onCancel={() => {
                            setShowPanel(false);
                            setSelectedProducto(null);
                        }}
                    />
                )}
            </div>

            <DataTable
                columns={columns}
                data={productos}
                emptyMessage={loading ? "Cargando..." : "No existen productos registrados"}
                paginationConfig={{
                    totalRecords: totalRecords,
                    serverPage: serverPage,
                    onServerPageChange: setServerPage
                }}
            />

            {modalOpen && (
                <ProductoModal
                    producto={selectedProducto}
                    productos={productos}
                    categoriaInicial={categoriaFiltro}
                    onSave={handleSave}
                    onClose={() => {
                        setModalOpen(false);
                        setShowPanel(false);
                        setSelectedProducto(null);
                    }}
                />
            )}
            {importModalOpen && (
                <ProductImportModal
                    categoriaId={Number(categoriaFiltro)}
                    categoriaNombre={categoriaSeleccionadaNombre}
                    marcas={marcas}
                    onClose={() => {
                        setImportModalOpen(false);
                        setServerPage(1); // Blindaje: Regresar a pág 1 para ver lo importado
                        fetchProductosDelServidor();
                    }}
                />
            )}
            {confirmOpen && productoEstado && (
                <ConfirmDialog
                    title={productoEstado.estado ? "Desactivar Producto" : "Activar Producto"}
                    message={productoEstado.estado ? `¿Desea desactivar el producto "${productoEstado.descripcion}"?` : `¿Desea activar el producto "${productoEstado.descripcion}"?`}
                    onConfirm={confirmStatusChange}
                    onClose={() => {
                        setConfirmOpen(false);
                        setProductoEstado(null);
                    }}
                />
            )}
        </div>
    );
}
export default Productos;