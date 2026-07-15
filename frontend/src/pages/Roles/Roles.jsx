import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader/PageHeader";
import Button from "../../components/Button/Button";
import SearchInput from "../../components/SearchInput/SearchInput";
import DataTable from "../../components/DataTable/DataTable";
import RowActions from "../../components/RowActions/RowActions";
import RolModal from "./RolModal";
import { rolesService } from "../../services/rolesService";
import "./Roles.css";
function Roles() {
    const navigate = useNavigate();
    // =====================================================
    // STATES
    // =====================================================
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState(null);
    // =====================================================
    // CARGAR ROLES
    // =====================================================
    const cargarRoles = async () => {
        try {
            setLoading(true);
            const response = await rolesService.getAll();
            setRoles(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                "No se pudieron cargar los roles.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarRoles();
    }, []);
    // =====================================================
    // NUEVO
    // =====================================================
    const handleNew = () => {
        setRolSeleccionado(null);
        setShowModal(true);
    };
    // =====================================================
    // EDITAR
    // =====================================================
    const handleEdit = (rol) => {
        setRolSeleccionado(rol);
        setShowModal(true);
    };
    // =====================================================
    // PERMISOS
    // =====================================================
    const handlePermissions = (rol) => {
        navigate(`/roles/${rol.id}/permisos`);
    };
    // =====================================================
    // GUARDAR
    // =====================================================
    const handleSave = async (data) => {
        try {
            if (rolSeleccionado) {
                await rolesService.update(
                    rolSeleccionado.id,
                    data
                );
            } else {
                await rolesService.create(data);
            }
            Swal.fire(
                "Correcto",
                rolSeleccionado
                    ? "Rol actualizado correctamente."
                    : "Rol creado correctamente.",
                "success"
            );
            setShowModal(false);
            cargarRoles();
        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "No se pudo guardar el rol.",
                "error"
            );
        }
    };
    // =====================================================
    // CAMBIAR ESTADO
    // =====================================================
    const handleToggleStatus = async (rol) => {
        const nuevoEstado = !rol.estado;
        const result = await Swal.fire({
            title: nuevoEstado
                ? "¿Activar Rol?"
                : "¿Desactivar Rol?",
            text: rol.nombre,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        });
        if (!result.isConfirmed)
            return;
        try {
            await rolesService.changeStatus(
                rol.id,
                nuevoEstado
            );
            Swal.fire(
                "Correcto",
                "Estado actualizado.",
                "success"
            );
            cargarRoles();
        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                "No se pudo actualizar el estado.",
                "error"
            );
        }
    };
    // =====================================================
    // FILTRO
    // =====================================================
    const rolesFiltrados = useMemo(() => {
        if (!search.trim())
            return roles;
        const texto = search.toLowerCase();
        return roles.filter((item) => {
            return (
                item.nombre
                    ?.toLowerCase()
                    .includes(texto)
                ||
                item.descripcion
                    ?.toLowerCase()
                    .includes(texto)
            );
        });
    }, [roles, search]);
    // =====================================================
    // COLUMNAS
    // =====================================================
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
            showTablet: true,
            showMobile: false,
            render: (row) =>
                row.descripcion || "-",
        },
        {
            key: "estado",
            label: "Estado",
            showDesktop: true,
            showTablet: true,
            showMobile: true,
            render: (row) =>
                row.estado
                    ? "Activo"
                    : "Inactivo",
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
                    onPermissions={handlePermissions}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                />
            ),
        },
    ];
    // =====================================================
    // RENDER
    // =====================================================
    return (
        <div className="page-container">
            <PageHeader
                title="Roles"
                subtitle="Administración de roles y permisos del sistema"
            />
            <div className="roles__filters">
                <div className="roles__item">
                    <SearchInput
                        id="rol-search"
                        name="rol-search"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar rol..."
                    />
                </div>
                <div className="roles__item">
                    <Button
                        variant="primary"
                        icon={<Plus size={18} />}
                        onClick={handleNew}
                    >
                        Nuevo Rol
                    </Button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={rolesFiltrados}
                emptyMessage={
                    loading
                        ? "Cargando roles..."
                        : "No existen roles registrados."
                }
            />
            <RolModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                rol={rolSeleccionado}
            />
        </div>
    );
}
export default Roles;