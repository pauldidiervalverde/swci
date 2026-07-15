import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";

import PageHeader from "../../components/PageHeader/PageHeader";
import SearchInput from "../../components/SearchInput/SearchInput";
import DataTable from "../../components/DataTable/DataTable";
import Button from "../../components/Button/Button";
import { useDebounce } from "../../hooks/useDebounce";
import { obtenerFechaBolivia } from "../../utils/normalizarHora";
import { ingresosService } from "../../services/ingresosService";
import RowActions from "../../components/RowActions/RowActions";

import "./Ingresos.css";
import { useIngresoStore } from "../../stores/ingresoStore";
import StockImportModal from "../Imports/StockImportModal";
import { categoriasService } from "../../services/categoriasService";
import { productosService } from "../../services/productosService";

function Ingresos() {
    // --- NAVEGACIÓN
    const navigate = useNavigate();
    const setIngresoId = useIngresoStore(
        (state) => state.setIngresoId
    );

    // --- HISTÓRICO COMPLETO Y FILTRADO
    const [todosIngresos, setTodosIngresos] = useState([]);
    const [ingresos, setIngresos] = useState([]);

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const [loading, setLoading] = useState(true);

    const [showImportModal, setShowImportModal] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);

    // ===========================================================
    // CARGA INICIAL (UNA SOLA CONSULTA AL BACKEND)
    // ===========================================================
    useEffect(() => {
        const cargarIngresos = async () => {
            try {
                setLoading(true);

                const response = await ingresosService.getAll();

                if (response.success) {
                    const datos = response.data?.data || response.data;

                    setTodosIngresos(datos);
                    setIngresos(datos);
                }
            } catch (error) {
                console.error("Error trayendo lista de ingresos:", error);
            } finally {
                setLoading(false);
            }
        };
        const loadStaticData = async () => {
            try {
                const [categoriasResponse, productosResponse] = await Promise.all([
                    categoriasService.getAll(),
                    productosService.getAll(),
                ]);
                if (categoriasResponse.success) {
                    setCategorias(categoriasResponse.data.filter((item) => item.estado));
                }
                if (productosResponse.success) {
                    setProductos(productosResponse.data.data);
                }
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            }
        };
        loadStaticData();

        cargarIngresos();
    }, []);

    // ===========================================================
    // FILTRADO LOCAL
    // ===========================================================
    useEffect(() => {
        if (!debouncedSearch.trim()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIngresos(todosIngresos);
            return;
        }

        const texto = debouncedSearch.toLowerCase().trim();

        const filtrados = todosIngresos.filter((item) => {
            const fecha = obtenerFechaBolivia(item.fecha).toLowerCase();

            return (
                item.codigo?.toLowerCase().includes(texto) ||
                item.observacion?.toLowerCase().includes(texto) ||
                item.usuario?.nombre?.toLowerCase().includes(texto) ||
                fecha.includes(texto)
            );
        });

        setIngresos(filtrados);
    }, [debouncedSearch, todosIngresos]);

    // ===========================================================
    // ACCIONES
    // ===========================================================
    const handleEdit = (row) => {
        setIngresoId(row.id);
        navigate(`/ingresos/editar`);
    };

    const handlePrint = (row) => {
        setIngresoId(row.id);
        navigate(`/ingresos/imprimir/${row.id}`);
    };



    // ===========================================================
    // COLUMNAS
    // ===========================================================
    const columns = [
        {
            key: "id",
            label: "Lote",
            alignClass: "text-center",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
        },
        {
            key: "fecha",
            label: "Fecha Lote",
            showDesktop: true,
            showTablet: true,
            showMobile: false,
            render: (row) => obtenerFechaBolivia(row.fecha),
        },
        {
            key: "observacion",
            label: "Observación / Nota",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
        },
        {
            key: "total",
            label: "Total Items",
            alignClass: "text-center",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) => row.totalPiezas + "  unid.",
        },
        {
            key: "nombre",
            label: "Encargado",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) => row.usuario.nombre,
        },
        {
            key: "codigo",
            label: "Codigo Registro",
            isPrimary: true,
            showDesktop: true,
            showTablet: true,
            showMobile: true,
        },


        {
            key: "acciones",
            label: "Acciones",
            showDesktop: true,
            showTablet: true,
            showMobile: true,
            render: (row) => (
                <RowActions
                    row={row}
                    onEdit={handleEdit}
                    onPrint={handlePrint}
                />
            ),
        },
    ];

    return (
        <div className="page-container">
            <PageHeader
                title="Ingresos de Mercadería"
                subtitle="Control de productos ingresados"
            />

            {/* Barra superior */}
            <div className="ingresos__filters">
                <div className="ingresos__item">
                    <SearchInput
                        id="ingreso-search"
                        name="ingreso-search"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar lote por observación, fecha, encargado o código..."
                    />
                </div>

                <div className="ingresos__item ingresos__actions">
                    <Button
                        variant="primary"
                        icon={<Plus size={18} />}
                        onClick={() => navigate("/ingresos/nuevo")}
                    >
                        Registrar Lote
                    </Button>
                    <Button variant="success" icon={<Upload size={18} />} onClick={() => setShowImportModal(true)}>
                        Carga de Stock
                    </Button>
                </div>
            </div>

            {/* Tabla */}
            <DataTable
                columns={columns}
                data={ingresos}
                emptyMessage={
                    loading
                        ? "Cargando histórico..."
                        : "No existen ingresos registrados"
                }
            />
            {showImportModal && (
                <StockImportModal
                    categorias={categorias}
                    productos={productos}
                    onClose={() => setShowImportModal(false)}
                />
            )}

        </div>
    );
}

export default Ingresos;