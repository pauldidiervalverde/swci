import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSignIcon } from "lucide-react";
import PageHeader from "../../components/PageHeader/PageHeader";
import SearchInput from "../../components/SearchInput/SearchInput";
import DataTable from "../../components/DataTable/DataTable";
import Button from "../../components/Button/Button";
import RowActions from "../../components/RowActions/RowActions";
import { useDebounce } from "../../hooks/useDebounce";
import { obtenerFechaBolivia } from "../../utils/normalizarHora";
import { ventasService } from "../../services/ventasService";
import { useVentaStore } from "../../stores/ventaStore";
import "../Ingresos/Ingresos.css";
function Ventas() {
    const navigate = useNavigate();
    const setVentaId = useVentaStore(
        (state) => state.setVentaId
    );
    const [todasVentas, setTodasVentas] =
        useState([]);
    const [ventas, setVentas] =
        useState([]);
    const [search, setSearch] =
        useState("");
    const debouncedSearch =
        useDebounce(search, 300);
    const [loading, setLoading] =
        useState(true);

    // CARGA INICIAL

    useEffect(() => {
        const cargarVentas = async () => {
            try {
                setLoading(true);
                const response =
                    await ventasService.getAll();
                if (response.success) {
                    const datos =
                        response.data?.data ||
                        response.data;
                    setTodasVentas(datos);
                    setVentas(datos);
                }
            } catch (error) {
                console.error(
                    "Error cargando ventas:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };
        cargarVentas();
    }, []);

    // FILTRO LOCAL

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVentas(todasVentas);
            return;
        }
        const texto =
            debouncedSearch
                .toLowerCase()
                .trim();
        const filtradas =
            todasVentas.filter((item) => {
                const fecha =
                    obtenerFechaBolivia(item.fecha)
                        .toLowerCase();
                return (
                    item.codigo
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    item.cliente?.nombre
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    item.usuario?.nombre
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    item.tipoPago?.nombre
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    item.observacion
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    fecha.includes(texto)
                );
            });
        setVentas(filtradas);
    }, [
        debouncedSearch,
        todasVentas
    ]);

    // ACCIONES

    const handleEdit = (row) => {
        setVentaId(row.id);
        navigate("/ventas/editar");
    };
    // const handleView = (row) => {
    //     setVentaId(row.id);
    //     navigate("/ventas/ver");
    // };
    const handlePrint = (row) => {
        setVentaId(row.id);
        navigate(`/ventas/imprimir/${row.id}`);
    };


    // COLUMNAS

    const columns = [
        {
            key: "numero",
            label: "Nro",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
        },
        {
            key: "fecha",
            label: "Fecha",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) =>
                obtenerFechaBolivia(row.fecha),
        },
        {
            key: "codigo",
            label: "Código",
            isPrimary: true,
            showDesktop: true,
            showTablet: true,
            showMobile: true,
        },
        {
            key: "cliente",
            label: "Cliente",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) =>
                row.cliente?.nombre || "S/N",
        },
        {
            key: "tipoPago",
            label: "Tipo Pago",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) =>
                row.tipoPago?.nombre,
        },
        {
            key: "total",
            label: "Total",
            showDesktop: true,
            showTablet: true,
            showMobile: false,
            render: (row) =>
                `Bs ${Number(row.total).toFixed(2)}`,
        },
        {
            key: "usuario",
            label: "Vendedor",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) =>
                row.usuario?.nombre,
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

    // RENDER

    return (
        <div className="page-container">
            <PageHeader
                title="Ventas"
                subtitle="Control y registro de ventas realizadas"
            />
            <div className="ingresos__filters">
                <div className="ingresos__item">
                    <SearchInput
                        id="venta-search"
                        name="venta-search"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar venta por código, cliente, vendedor, fecha o tipo de pago..."
                    />
                </div>
                <div className="ingresos__item ingresos__actions">
                    <Button
                        variant="primary"
                        icon={<DollarSignIcon size={18} />}
                        onClick={() =>
                            navigate("/ventas/nuevo")
                        }
                    >
                        Nueva Venta
                    </Button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={ventas}
                emptyMessage={
                    loading
                        ? "Cargando ventas..."
                        : "No existen ventas registradas"
                }
            />
        </div>
    );
}
export default Ventas;