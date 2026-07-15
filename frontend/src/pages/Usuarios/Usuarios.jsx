import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader/PageHeader";
import Button from "../../components/Button/Button";
import SearchInput from "../../components/SearchInput/SearchInput";
import DataTable from "../../components/DataTable/DataTable";
import RowActions from "../../components/RowActions/RowActions";
import UsuarioModal from "./UsuarioModal";
import { usuariosService } from "../../services/usuariosService.js";
import { rolesService } from "../../services/rolesService.js";
import "./Usuarios.css";
function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    // =====================================================
    // CARGAR DATOS
    // =====================================================
    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await usuariosService.getAll();

            setUsuarios(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                "No se pudieron cargar los usuarios",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };
    const cargarRoles = async () => {
        try {
            const response = await rolesService.getAll();
            setRoles(response.data);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarUsuarios();
        cargarRoles();
    }, []);
    // =====================================================
    // NUEVO
    // =====================================================
    const handleNew = () => {
        setUsuarioSeleccionado(null);
        setShowModal(true);
    };
    // =====================================================
    // EDITAR
    // =====================================================
    const handleEdit = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setShowModal(true);
    };
    // =====================================================
    // GUARDAR
    // =====================================================
    const handleSave = async (data) => {

        try {
            if (usuarioSeleccionado) {

                await usuariosService.update(
                    usuarioSeleccionado.id,
                    data
                );
            } else {
                await usuariosService.create(data);
            }
            Swal.fire(
                "Correcto",
                usuarioSeleccionado
                    ? "Usuario actualizado"
                    : "Usuario creado correctamente",
                "success"
            );
            setShowModal(false);
            cargarUsuarios();
        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "No se pudo guardar el usuario",
                "error"
            );
        }
    };
    // =====================================================
    // CAMBIO ESTADO
    // =====================================================
    const handleToggleStatus = async (usuario) => {
        const nuevoEstado = !usuario.estado;
        const result = await Swal.fire({
            title: nuevoEstado
                ? "¿Activar usuario?"
                : "¿Desactivar usuario?",
            text: usuario.nombre,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar"
        });
        if (!result.isConfirmed)
            return;
        try {
            await usuariosService.changeStatus(
                usuario.id,
                nuevoEstado
            );
            Swal.fire(
                "Correcto",
                "Estado actualizado",
                "success"
            );
            cargarUsuarios();
        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                "No se pudo cambiar el estado",
                "error"
            );
        }
    };
    // =====================================================
    // BUSQUEDA
    // =====================================================
    const usuariosFiltrados = useMemo(() => {
        if (!search.trim())
            return usuarios;
        const texto = search.toLowerCase();
        return usuarios.filter((item) => {
            return (
                item.nombre
                    ?.toLowerCase()
                    .includes(texto)
                ||
                item.usuario
                    ?.toLowerCase()
                    .includes(texto)
                ||
                item.rol?.nombre
                    ?.toLowerCase()
                    .includes(texto)
            );
        });
    }, [usuarios, search]);
    // =====================================================
    // COLUMNAS DATATABLE
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
            key: "usuario",
            label: "Usuario",
            showDesktop: true,
            showTablet: true,
            showMobile: false,
        },
        {
            key: "rol",
            label: "Rol",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) =>
                row.rol?.nombre || "-"
        },
        {
            key: "tienda",
            label: "Tienda",
            showDesktop: true,
            showTablet: false,
            showMobile: false,
            render: (row) =>
                row.tiendas
                    ?.map(
                        item => item.tienda?.nombre
                    )
                    .join(", ")
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
                    : "Inactivo"
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
            )
        }
    ];
    return (
        <div className="page-container">
            <PageHeader
                title="Usuarios"
                subtitle="Administración de usuarios del sistema"
            />
            <div className="marcas__filters">
                <div className="marcas__item">
                    <SearchInput
                        id="usuario-search"
                        name="usuario-search"
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar usuario..."
                    />
                </div>
                <div className="marcas__item">
                    <Button
                        variant="primary"
                        icon={<Plus size={18} />}
                        onClick={handleNew}
                    >
                        Nuevo Usuario
                    </Button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={usuariosFiltrados}
                emptyMessage={
                    loading
                        ? "Cargando usuarios..."
                        : "No existen usuarios registrados"
                }
            />
            <UsuarioModal
                open={showModal}
                onClose={() =>
                    setShowModal(false)
                }
                onSave={handleSave}
                usuario={usuarioSeleccionado}
                roles={roles}
            />
        </div>
    );
}
export default Usuarios;