import { useEffect, useMemo, useState } from "react";

import { Plus } from "lucide-react";

import PageHeader from "../../components/PageHeader/PageHeader";
import SearchInput from "../../components/SearchInput/SearchInput";
import DataTable from "../../components/DataTable/DataTable";
import Button from "../../components/Button/Button";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import RowActions from "../../components/RowActions/RowActions";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";

import { useDebounce } from "../../hooks/useDebounce";
import MarcaModal from "./MarcaModal";
import { marcasService } from "../../services/marcasService";
import "./Marcas.css";

function Marcas() {
    const [marcas, setMarcas] = useState([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMarca, setSelectedMarca] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [marcaEstado, setMarcaEstado] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const response =
                await marcasService.getAll();

            if (response.success) {
                setMarcas(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response =
                    await marcasService.getAll();
                if (response.success) {
                    setMarcas(response.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        const searchText = debouncedSearch.toLowerCase();
        const filtered = marcas.filter((marca) =>
            [marca.nombre, marca.descripcion]
                .filter(Boolean)
                .some((valor) =>
                    valor.toLowerCase().includes(searchText)
                )
        );
        return filtered.sort((a, b) => {
            if (a.estado !== b.estado) {
                return b.estado - a.estado;
            }
            return a.nombre.localeCompare(
                b.nombre,
                "es",
                {
                    sensitivity: "base",
                }
            );
        });
    }, [marcas, debouncedSearch]);

    const handleNew = () => {
        setSelectedMarca(null);
        setModalOpen(true);
    };
    const handleEdit = async (row) => {
        try {
            const response =
                await marcasService.getById(
                    row.id
                );
            if (response.success) {
                setSelectedMarca(
                    response.data
                );
                setModalOpen(true);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handleSave = async (data) => {
        try {
            if (selectedMarca) {
                await marcasService.update(
                    selectedMarca.id,
                    data
                );
            } else {
                await marcasService.create(
                    data
                );
            }
            setModalOpen(false);
            setSelectedMarca(null);
            await loadData();
        } catch (error) {
            alert(
                error?.response?.data
                    ?.message ||
                "Error al guardar"
            );
        }
    };
    const handleToggleStatus = (
        row
    ) => {
        setMarcaEstado(row);
        setConfirmOpen(true);
    };
    const confirmStatusChange =
        async () => {
            try {
                await marcasService.changeStatus(
                    marcaEstado.id,
                    !marcaEstado.estado
                );
                setConfirmOpen(false);
                setMarcaEstado(null);
                await loadData();
            } catch (error) {
                console.error(error);
            }
        };
    const columns = [
        {
            key: "nombre",
            label: "Nombre",

            isPrimary: true,

            showDesktop: true,
            showTablet: true,
            showMobile: true,
        },

        {
            key: "descripcion",
            label: "Descripción",

            showDesktop: true,
            showTablet: false,
            showMobile: false,
        },

        {
            key: "estado",
            label: "Estado",

            showDesktop: true,
            showTablet: true,
            showMobile: false,

            render: (row) => (
                <StatusBadge
                    status={row.estado}
                />
            ),
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
                    onToggleStatus={
                        handleToggleStatus
                    }
                />
            ),
        },
    ];
    return (
        <div className="page-container">
            <PageHeader
                title="Marcas"
                subtitle="Administración de marcas"
            />
            <div className="marcas__filters">
                <div className="marcas__item">
                    <SearchInput
                        id="marca-search"
                        name="marca-search"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar marca..."
                    />
                </div>
                <div className="marcas__item">
                    <Button
                        icon={<Plus size={18} />}
                        onClick={handleNew}
                    >
                        Nueva Marca
                    </Button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={filteredData}
                emptyMessage={
                    loading
                        ? "Cargando..."
                        : "No existen marcas registradas"
                }
            />
            {modalOpen && (
                <MarcaModal
                    marca={selectedMarca}
                    marcas={marcas}
                    onSave={handleSave}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedMarca(
                            null
                        );
                    }}
                />
            )}
            {confirmOpen &&
                marcaEstado && (
                    <ConfirmDialog
                        title={
                            marcaEstado.estado
                                ? "Desactivar Marca"
                                : "Activar Marca"
                        }
                        message={
                            marcaEstado.estado
                                ? `¿Desea desactivar la marca "${marcaEstado.nombre}"?`
                                : `¿Desea activar la marca "${marcaEstado.nombre}"?`
                        }
                        onConfirm={
                            confirmStatusChange
                        }
                        onClose={() => {
                            setConfirmOpen(
                                false
                            );
                            setMarcaEstado(
                                null
                            );
                        }}
                    />
                )}
        </div>
    );
}

export default Marcas;