import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader/PageHeader";
import Button from "../../components/Button/Button";
import SearchInput from "../../components/SearchInput/SearchInput";
import DataTable from "../../components/DataTable/DataTable";
import { salidasService } from "../../services/salidasService";
import { useSalidaStore } from "../../stores/salidaStore";
import "../Ingresos/Ingresos.css";
import { obtenerFechaBolivia } from "../../utils/normalizarHora";
import RowActions from "../../components/RowActions/RowActions";

function Salidas() {
    const navigate = useNavigate();
    const { setId } = useSalidaStore();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [salidas, setSalidas] = useState([]);
    // Cargar información    

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                Swal.fire({
                    title: "Cargando...",
                    text: "Obteniendo salidas.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading(),
                });
                const response =
                    await salidasService.getAll();
                Swal.close();
                if (response.success) {
                    setSalidas(response.data);
                }
            } catch (error) {
                Swal.close();
                Swal.fire({
                    title: "Error",
                    text:
                        error?.response?.data?.message ||
                        "No se pudieron cargar las salidas.",
                    icon: "error",
                    confirmButtonColor:
                        "var(--color-primary)",
                });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    // Editar    
    const handleEdit = (row) => {
        setId(row.id);
        navigate("/salidas/editar");
    };
    const handlePrint = (row) => {
        setId(row.id);
        navigate(`/salidas/imprimir/${row.id}`);
    };
    // Filtro    
    const rows = useMemo(() => {
        if (!search.trim()) return salidas;
        const value =
            search.toLowerCase();
        return salidas.filter((item) => {
            return (
                item.codigo
                    ?.toLowerCase()
                    .includes(value)
                ||
                item.cliente?.nombre
                    ?.toLowerCase()
                    .includes(value)
                ||
                item.tipoMovimiento?.nombre
                    ?.toLowerCase()
                    .includes(value)
                ||
                item.observacion
                    ?.toLowerCase()
                    .includes(value)
            );
        });
    }, [salidas, search]);


    // const columns = [
    //     {
    //         header: "Código",
    //         accessor: "codigo",
    //     },
    //     {
    //         header: "Fecha",
    //         accessor: "fecha",
    //         render: (row) =>
    //             new Date(row.fecha)
    //                 .toLocaleDateString(),
    //     },
    //     {
    //         header: "Cliente",
    //         render: (row) =>
    //             row.cliente?.nombre || "-",
    //     },
    //     {
    //         header: "Movimiento",
    //         render: (row) =>
    //             row.tipoMovimiento?.nombre,
    //     },
    //     {
    //         header: "Observación",
    //         accessor: "observacion",
    //     },
    //     {
    //         header: "",
    //         align: "center",
    //         render: (row) => (
    //             <Button
    //                 variant="warning"
    //                 icon={<Pencil size={16} />}
    //                 onClick={() =>
    //                     handleEdit(row)
    //                 }
    //             >
    //                 Editar
    //             </Button>
    //         ),
    //     },
    // ];

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
            key: "tipo",
            label: "Movimiento",
            alignClass: "text-center",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) => row.tipoMovimiento.nombre,
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
                title="Egresos / Salidas"
                subtitle="Promociones, regalos y canjes."

            />
            <div className="ingresos__filters">
                <div className="ingresos__item">
                    <SearchInput
                        id="buscar"
                        name="buscar"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar salida..."
                    />
                </div>

                <div className="ingresos__item">
                    <Button
                        variant="primary"
                        icon={<Plus size={18} />}
                        onClick={() =>
                            navigate("/salidas/nuevo")
                        }
                    >
                        Registrar Salida
                    </Button>
                </div>
            </div>
            <DataTable

                columns={columns}
                data={rows}
                emptyMessage={
                    loading
                        ? "Cargando histórico..."
                        : "No existen egresos registrados"
                }
            />
        </div>
    );
}
export default Salidas;