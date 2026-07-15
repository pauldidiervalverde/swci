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

import CategoriaModal from "./CategoriaModal";
import { categoriasService } from "../../services/categoriasService";

import "./Categorias.css";

function Categorias() {
    const [categorias, setCategorias] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const debouncedSearch =
        useDebounce(search, 300);

    const [loading, setLoading] =
        useState(true);

    const [modalOpen, setModalOpen] =
        useState(false);

    const [
        selectedCategoria,
        setSelectedCategoria,
    ] = useState(null);

    const [confirmOpen, setConfirmOpen] =
        useState(false);

    const [
        categoriaEstado,
        setCategoriaEstado,
    ] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);

            const response =
                await categoriasService.getAll();

            if (response.success) {
                setCategorias(response.data);
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
                    await categoriasService.getAll();

                if (response.success) {
                    setCategorias(response.data);
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

        const searchText =
            debouncedSearch.toLowerCase();

        const filtered =
            categorias.filter(
                (categoria) =>
                    [
                        categoria.nombre,
                        categoria.descripcion,
                    ]
                        .filter(Boolean)
                        .some((valor) =>
                            valor
                                .toLowerCase()
                                .includes(
                                    searchText
                                )
                        )
            );

        return filtered.sort((a, b) => {

            if (
                a.estado !==
                b.estado
            ) {
                return (
                    b.estado - a.estado
                );
            }

            return a.nombre.localeCompare(
                b.nombre,
                "es",
                {
                    sensitivity:
                        "base",
                }
            );
        });

    }, [
        categorias,
        debouncedSearch,
    ]);

    const handleNew = () => {
        setSelectedCategoria(null);
        setModalOpen(true);
    };

    const handleEdit = async (
        row
    ) => {
        try {
            const response =
                await categoriasService.getById(
                    row.id
                );

            if (response.success) {
                setSelectedCategoria(
                    response.data
                );

                setModalOpen(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (
        data
    ) => {
        try {
            if (
                selectedCategoria
            ) {
                await categoriasService.update(
                    selectedCategoria.id,
                    data
                );
            } else {
                await categoriasService.create(
                    data
                );
            }

            setModalOpen(false);

            setSelectedCategoria(
                null
            );

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
        setCategoriaEstado(row);
        setConfirmOpen(true);
    };

    const confirmStatusChange =
        async () => {
            try {
                await categoriasService.changeStatus(
                    categoriaEstado.id,
                    !categoriaEstado.estado
                );

                setConfirmOpen(
                    false
                );

                setCategoriaEstado(
                    null
                );

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
            alignClass: "text-center",
            showDesktop: true,
            showTablet: true,
            showMobile: true,

            render: (row) => (
                <StatusBadge
                    status={
                        row.estado
                    }
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
                    onEdit={
                        handleEdit
                    }
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
                title="Categorías"
                subtitle="Administración de categorías"
            />

            <div className="ingresos__filters">
                <div className="ingresos__item">
                    <SearchInput
                        id="categoria-search"
                        name="categoria-search"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar categoría..."
                    />
                </div>
                <div className="ingresos__item">
                    <Button
                        icon={<Plus size={18} />}
                        onClick={handleNew}
                    >
                        Nueva Categoría
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredData}
                emptyMessage={
                    loading
                        ? "Cargando..."
                        : "No existen categorías registradas"
                }
            />

            {modalOpen && (
                <CategoriaModal
                    categoria={
                        selectedCategoria
                    }
                    categorias={
                        categorias
                    }
                    onSave={
                        handleSave
                    }
                    onClose={() => {
                        setModalOpen(
                            false
                        );

                        setSelectedCategoria(
                            null
                        );
                    }}
                />
            )}

            {confirmOpen &&
                categoriaEstado && (
                    <ConfirmDialog
                        title={
                            categoriaEstado.estado
                                ? "Desactivar Categoría"
                                : "Activar Categoría"
                        }
                        message={
                            categoriaEstado.estado
                                ? `¿Desea desactivar la categoría "${categoriaEstado.nombre}"?`
                                : `¿Desea activar la categoría "${categoriaEstado.nombre}"?`
                        }
                        onConfirm={
                            confirmStatusChange
                        }
                        onClose={() => {
                            setConfirmOpen(
                                false
                            );

                            setCategoriaEstado(
                                null
                            );
                        }}
                    />
                )}
        </div>
    );
}

export default Categorias;