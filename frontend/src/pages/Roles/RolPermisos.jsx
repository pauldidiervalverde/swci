import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader/PageHeader";
import Button from "../../components/Button/Button";
import { rolesService } from "../../services/rolesService";
import "./RolPermisos.css";
function RolPermisos() {
    const { id } = useParams();
    const navigate = useNavigate();
    // =====================================================
    // STATES
    // =====================================================
    const [loading, setLoading] = useState(true);
    const [permisos, setPermisos] = useState([]);
    // =====================================================
    // CARGAR PERMISOS
    // =====================================================
    const cargarPermisos = async () => {
        try {
            setLoading(true);
            const response =
                await rolesService.getPermisos(id);
            setPermisos(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                "No se pudieron cargar los permisos.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPermisos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    // =====================================================
    // SWITCH
    // =====================================================
    const handleToggle = (moduloId) => {
        setPermisos((prev) =>
            prev.map((item) => {
                if (item.moduloId !== moduloId)
                    return item;
                const permitido = !item.permitido;
                return {
                    ...item,
                    permitido,
                    ver: permitido,
                    crear: permitido,
                    editar: permitido,
                    eliminar: permitido,
                };
            })
        );
    };
    // =====================================================
    // GUARDAR
    // =====================================================
    const handleGuardar = async () => {
        try {
            const payload = {
                permisos: permisos.map((item) => ({
                    moduloId: item.moduloId,
                    ver: item.ver,
                    crear: item.crear,
                    editar: item.editar,
                    eliminar: item.eliminar,
                })),
            };

            await rolesService.updatePermisos(id, payload);

            Swal.fire(
                "Correcto",
                "Permisos actualizados correctamente.",
                "success"
            );
        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "No se pudieron actualizar los permisos.",
                "error"
            );
        }
    };
    // =====================================================
    // AGRUPAR MODULOS
    // =====================================================
    const grupos = useMemo(() => {
        return permisos.reduce((acc, modulo) => {
            if (!acc[modulo.grupo]) {
                acc[modulo.grupo] = [];
            }
            acc[modulo.grupo].push(modulo);
            return acc;
        }, {});
    }, [permisos]);
    // =====================================================
    // RENDER
    // =====================================================
    return (
        <div className="page-container">
            <PageHeader
                title="Permisos por Rol"
                subtitle="Habilite o deshabilite el acceso a cada módulo del sistema."
            />
            {
                loading ? (
                    <div className="rol-permisos__loading">
                        Cargando permisos...
                    </div>
                ) : (
                    <div className="rol-permisos">
                        {
                            Object.entries(grupos).map(
                                ([grupo, modulos]) => (
                                    <div
                                        key={grupo}
                                        className="rol-permisos__grupo"
                                    >
                                        <div className="rol-permisos__header">
                                            <h3>
                                                {grupo}
                                            </h3>
                                        </div>
                                        <div className="rol-permisos__body">
                                            {
                                                modulos.map((modulo) => (
                                                    <div
                                                        key={modulo.moduloId}
                                                        className="rol-permisos__item"
                                                    >
                                                        <div className="rol-permisos__info">
                                                            <span className="rol-permisos__nombre">
                                                                {modulo.nombre}
                                                            </span>
                                                            <span className="rol-permisos__ruta">
                                                                {modulo.ruta}
                                                            </span>
                                                        </div>
                                                        <label className="switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={modulo.permitido}
                                                                onChange={() =>
                                                                    handleToggle(
                                                                        modulo.moduloId
                                                                    )
                                                                }
                                                            />
                                                            <span className="slider"></span>
                                                        </label>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )
                            )
                        }
                        <div className="rol-permisos__actions">
                            <Button
                                variant="secondary"
                                onClick={() => navigate(-1)}
                            >
                                Volver
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleGuardar}
                            >
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
export default RolPermisos;