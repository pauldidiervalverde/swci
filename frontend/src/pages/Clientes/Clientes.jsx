import { useEffect, useState, useCallback, useMemo } from "react";
import PageHeader from "../../components/PageHeader/PageHeader";
import DataTable from "../../components/DataTable/DataTable";
import Modal from "../../components/Modal/Modal";
import ClienteForm from "./ClienteForm";
import { clientesService } from "../../services/clientesService";
import "./Clientes.css";
import RowActions from "../../components/RowActions/RowActions";
import Button from "../../components/Button/Button";
import { UserPlus } from "lucide-react";
import SearchInput from "../../components/SearchInput/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";

function Clientes() {
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    // Estados para controlar el modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCliente, setCurrentCliente] = useState(null); // null = Crear, Objeto = Editar

    const loadClientes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await clientesService.getAll();
            if (response.success) {
                setClientes(response.data || []);
            }
        } catch (error) {
            console.error("Error cargando clientes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadClientes();
    }, [loadClientes]);

    const filteredData = useMemo(() => {
        const searchText = debouncedSearch.toLowerCase();
        const filtered = clientes.filter((marca) =>
            [marca.nombre, marca.telefono]
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
    }, [clientes, debouncedSearch]);

    const handleOpenCreateModal = () => {
        setCurrentCliente(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (cliente) => {
        setCurrentCliente(cliente);
        setIsModalOpen(true);
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false); // Cerrar ventana modal
        loadClientes();       // Refrescar tabla en caliente
    };

    const columns = [
        { key: "nombre", label: "Nombre / Razón Social", isPrimary: true, showDesktop: true, showTablet: true, showMobile: true },
        { key: "nit", label: "NIT / CI", showDesktop: true, showTablet: false, showMobile: false },
        { key: "telefono", label: "Teléfono", showDesktop: true, showTablet: true, showMobile: false },
        { key: "correo", label: "E-mail", showDesktop: true, showTablet: false, showMobile: false },
        { key: "direccion", label: "Dirección", showDesktop: true, showTablet: false, showMobile: false },
        {
            key: "acciones",
            label: "Acciones",
            showDesktop: true,
            showTablet: true,
            showMobile: true,
            render: (row) => (
                <RowActions
                    row={row}
                    onEdit={handleOpenEditModal}

                />

            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="clientes__header-wrapper">
                <PageHeader title="Clientes" subtitle="Gestión de la base de datos de compradores" />
            </div>
            <div className="marcas__filters">
                <div className="marcas__item">
                    <SearchInput
                        id="client-search"
                        name="client-search"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar cliente..."
                    />
                </div>
                <div className="marcas__item">
                    <Button icon={<UserPlus size={18} />} onClick={handleOpenCreateModal}>
                        Nuevo Cliente
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredData}
                emptyMessage={loading ? "Cargando clientes..." : "No existen clientes registrados"}
            />

            {/* 🌟 Inyección limpia del Formulario adentro de tu Modal modular */}
            {isModalOpen && (
                <Modal
                    title={currentCliente ? "Modificar Cliente" : "Registrar Nuevo Cliente"}
                    size="small"
                    onClose={() => setIsModalOpen(false)}
                >
                    <ClienteForm
                        clienteData={currentCliente}
                        onSuccess={handleFormSuccess}
                    />
                </Modal>
            )}
        </div>
    );
}

export default Clientes;