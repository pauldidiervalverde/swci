import { useState, useEffect } from "react";
import { ClipboardCheck, ShieldAlert, TrendingUp, ShoppingBag, RefreshCcw } from "lucide-react";
import Swal from "sweetalert2";
import { useAuthStore } from "../../stores/authStore";
import { kardexService } from "../../services/kardexService.js";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import SelectField from "../../components/SelectField/SelectField";
import Button from "../../components/Button/Button.jsx";
import "./Auditoria.css";
import AuditoriaTimeline from "./AuditoriaTimeline.jsx";
import { formatFechaCorta, formatHora } from "../../utils/normalizarHora.js";

// 1. Constantes de configuración de Meses para el año en curso (2026)
const ANIO_ACTUAL = 2026;
const MESES_OPCIONES = [
    { id: "01", nombre: "Enero" },
    { id: "02", nombre: "Febrero" },
    { id: "03", nombre: "Marzo" },
    { id: "04", nombre: "Abril" },
    { id: "05", nombre: "Mayo" },
    { id: "06", nombre: "Junio" },
    { id: "07", nombre: "Julio" },
    { id: "08", nombre: "Agosto" },
    { id: "09", nombre: "Septiembre" },
    { id: "10", nombre: "Octubre" },
    { id: "11", nombre: "Noviembre" },
    { id: "12", nombre: "Diciembre" },
];

const GRUPOS_MOVIMIENTO = [
    { id: "INGRESOS", nombre: "INGRESOS" },
    { id: "VENTAS", nombre: "VENTAS" },
    { id: "SALIDAS", nombre: "SALIDAS (Otros)" },
];

function Auditoria() {
    // Obtener mes actual por defecto formateado a dos dígitos (ej: "07")
    const mesActualId = String(new Date().getMonth() + 1).padStart(2, "0");
    const tiendaActiva = useAuthStore((state) => state.tiendaActiva);
    // Estados de Filtros
    const [mesSeleccionado, setMesSeleccionado] = useState(mesActualId);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [grupoMovimiento, setGrupoMovimiento] = useState("");
    const [marcaSeleccionada, setMarcaSeleccionada] = useState("");

    // Estados de Datos del Backend
    const [auditData, setAuditData] = useState(null);
    const [movimientosFiltrados, setMovimientosFiltrados] = useState([]);
    const [marcasDisponibles, setMarcasDisponibles] = useState([]);



    // Función para calcular e inyectar el rango de días de un mes seleccionado
    const configurarFechasPorMes = (mesId) => {
        if (!mesId) return;
        const primerDia = `${ANIO_ACTUAL}-${mesId}-01`;
        // El día 0 del mes siguiente nos da el último día del mes actual
        const ultimoDiaNumero = new Date(ANIO_ACTUAL, parseInt(mesId), 0).getDate();
        const ultimoDia = `${ANIO_ACTUAL}-${mesId}-${String(ultimoDiaNumero).padStart(2, "0")}`;

        setFechaInicio(primerDia);
        setFechaFin(ultimoDia);
    };
    // Inicializar fechas basadas en el mes por defecto al montar el componente
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        configurarFechasPorMes(mesActualId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Manejador del cambio de mes
    const handleMesChange = (e) => {
        const mesId = e.target.value;
        setMesSeleccionado(mesId);
        configurarFechasPorMes(mesId);
    };
    const filtrarDataLocal = (movimientos, grupo, marca) => {
        let resultado = [...movimientos];

        // 1. Filtrar por Grupo conceptual
        if (grupo) {
            if (grupo === "INGRESOS") {
                resultado = resultado.filter((m) => m.tipoMovimiento?.naturaleza === "ENTRADA");
            } else if (grupo === "VENTAS") {
                resultado = resultado.filter((m) => m.tipoMovimiento?.nombre === "VENTA");
            } else if (grupo === "SALIDAS") {
                // Excluye expresamente las VENTAS dentro del conjunto global de salidas
                resultado = resultado.filter(
                    (m) => m.tipoMovimiento?.naturaleza === "SALIDA" && m.tipoMovimiento?.nombre !== "VENTA"
                );
            }
        }

        // 2. Filtrar por Marca
        if (marca) {
            resultado = resultado.filter((m) => m.producto?.marca === marca);
        }

        setMovimientosFiltrados(resultado);
    };

    // Carga Remota de Datos con SweetAlert2 Loading
    const cargarAuditoria = async () => {
        if (!fechaInicio || !fechaFin) return;

        // Mostrar modal persistente de carga masiva
        Swal.fire({
            title: `Tienda ${tiendaActiva.nombre}`,
            html: `Procesando movimientos para Auditoría `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            if (!fechaInicio || !fechaFin) return;
            const dateInicioLocal = new Date(`${fechaInicio}T00:00:00`);
            const dateFinLocal = new Date(`${fechaFin}T23:59:59`);

            // 1. Armas el paquete de filtros (puedes meter los que quieras aquí)
            const filtrosQuery = {
                fechaInicio: dateInicioLocal.toISOString(), // Enviará algo como: "2026-07-01T04:00:00.000Z"
                fechaFin: dateFinLocal.toISOString()       // Enviará algo como: "2026-08-01T03:59:59.000Z"
            };

            //const response = await kardexService.getGeneral(`/kardex?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
            const response = await kardexService.getGeneral(filtrosQuery);

            if (response && response.success) {
                const data = response.data;
                setAuditData(data);

                // Extraer dinámicamente las marcas únicas presentes en este lote de datos
                const marcasUnicas = [
                    ...new Set(data.movimientos.map((m) => m.producto?.marca).filter(Boolean)),
                ].map((marca) => ({ id: marca, nombre: marca }));

                setMarcasDisponibles(marcasUnicas);

                // Aplicar filtros locales inmediatos combinando grupo y marca si los hubiera
                filtrarDataLocal(data.movimientos, grupoMovimiento, marcaSeleccionada);
                Swal.close();
            } else {
                throw new Error(response.message ? response.message : "Error al obtener datos.");
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error de Servidor",
                text: "No se pudo recuperar el historial solicitado. Revisar los parametros.",
                confirmButtonColor: "var(--color-primary)",
            });
        }
    };

    // Disparar la consulta cada vez que las fechas críticas de rango cambien
    // useEffect(() => {        
    //     cargarAuditoria();        
    // }, []);

    // Filtrado reactivo en el cliente para evitar peticiones redundantes por marca o grupo
    useEffect(() => {
        if (auditData?.movimientos) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            filtrarDataLocal(auditData.movimientos, grupoMovimiento, marcaSeleccionada);
        }
    }, [grupoMovimiento, marcaSeleccionada, auditData]);



    // Despliegue de SweetAlert Informativo Completo al hacer Click en una Fila
    const handleVerDetalle = (mov) => {
        Swal.fire({
            title: `<span className="auditoria-swal-title">Comprobante de Movimiento</span>`,
            html: `
        <div className="auditoria-swal-wrapper">
          <div className="auditoria-swal-section">
            <h4>📦 Información del Artículo</h4>
            <p><strong>Descripción:</strong> ${mov.producto?.descripcion || "N/A"}</p>
            <p><strong>SKU:</strong> ${mov.producto?.sku || "N/A"} | <strong>Código:</strong> ${mov.producto?.codigo || "N/A"}</p>
            <p><strong>Marca:</strong> ${mov.producto?.marca || "N/A"} | <strong>Categoría:</strong> ${mov.producto?.categoria || "N/A"}</p>
            <p><strong>Color:</strong> ${mov.producto?.color || "N/A"} | <strong>Talla:</strong> ${mov.producto?.tallas || "N/A"}</p>
          </div>
          <hr className="auditoria-swal-divider" />
          <div className="auditoria-swal-section">
            <h4>📋 Detalles de la Operación</h4>
            <p><strong>Documento Código:</strong> ${mov.documento?.codigo || "Sin código"}</p>
            <p><strong>Operación:</strong> <span className="auditoria-swal-badge">${mov.tipoMovimiento?.nombre} (${mov.tipoMovimiento?.naturaleza})</span></p>
            <p><strong>Fecha/Hora de Registro:</strong> ${formatFechaCorta(mov.fecha)} ${formatHora(mov.fecha)}</p>
            <p><strong>Usuario Responsable:</strong> ${mov.usuario?.nombre || "Sistema"}</p>
            <p><strong>Cantidad Transada:</strong> ${mov.cantidad} unidades</p>
            <p><strong>Flujo de Stock:</strong> ${mov.stockAnterior} u. ➔ ${mov.stockNuevo} u.</p>
            <p><strong>Observaciones:</strong> <i>${mov.observacion || "Ninguna registrada"}</i></p>
          </div>
        </div>
      `,
            icon: "info",
            confirmButtonText: "Cerrar Panel",
            confirmButtonColor: "var(--color-primary)",
            customClass: {
                popup: "auditoria-swal-popup-custom"
            }
        });
    };

    return (
        <div className="auditoria-main-container">
            {/* HEADER DE LA SECCIÓN */}
            <div className="auditoria-top-bar">
                <div>
                    <h1 className="auditoria-title-page">Módulo de Auditoría Global</h1>
                    <p className="auditoria-subtitle-page">Seguimiento y conciliación cruzada de movimientos físicos</p>
                </div>
                <Button onClick={cargarAuditoria} icon={<RefreshCcw size={16} />}>
                    Sincronizar Datos
                </Button>
            </div>

            {/* CONTENEDOR FLUIDO DE FILTROS PERSONALIZADOS */}
            <div className="auditoria-filter-board">
                <div className="auditoria-filter-grid">
                    <SelectField
                        id="mesFiltro"
                        name="mesFiltro"
                        label="Filtrar por Mes"
                        value={mesSeleccionado}
                        onChange={handleMesChange}
                        options={MESES_OPCIONES}
                        placeholder="Seleccione mes..."
                    />

                    <div className="auditoria-date-input-group">
                        <label className="auditoria-label-native">Fecha Desde</label>
                        <input
                            type="date"
                            className="auditoria-date-control"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>

                    <div className="auditoria-date-input-group">
                        <label className="auditoria-label-native">Fecha Hasta</label>
                        <input
                            type="date"
                            className="auditoria-date-control"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>

                    <SelectField
                        id="grupoMovimiento"
                        name="grupoMovimiento"
                        label="Grupo de Movimiento"
                        value={grupoMovimiento}
                        onChange={(e) => setGrupoMovimiento(e.target.value)}
                        options={GRUPOS_MOVIMIENTO}
                        placeholder="Todos los grupos"
                    />

                    <SelectField
                        id="marcaFiltro"
                        name="marcaFiltro"
                        label="Filtrar por Marca"
                        value={marcaSeleccionada}
                        onChange={(e) => setMarcaSeleccionada(e.target.value)}
                        options={marcasDisponibles}
                        placeholder="Todas las marcas"
                    />
                </div>
            </div>

            {/* RENDERIZADO DE DASHBOARD CARDS REUTILIZADOS */}
            {auditData?.indicadores && (
                <div className="auditoria-kpi-row">
                    <DashboardCard
                        title="Transacciones"
                        value={movimientosFiltrados.length}
                        suffix="unidades"
                        icon={ClipboardCheck}
                        status="info"
                    />
                    <DashboardCard
                        title="Productos Afectados"
                        value={auditData.indicadores.productosAfectados}
                        icon={ShieldAlert}
                        status="normal"
                    />
                    <DashboardCard
                        title="Ventas Confirmadas"
                        value={auditData.totales.ventas.total}
                        suffix="unidades"
                        icon={ShoppingBag}
                        status="success"
                    />
                    <DashboardCard
                        title="Salida de Productos "
                        value={auditData.indicadores.totalSalidas - auditData.totales.ventas.total}
                        suffix="unidades"
                        icon={TrendingUp}
                        status="warning"
                    />
                </div>
            )}

            {/* LÍNEA DE TIEMPO DE AUDITORÍA (REEMPLAZO DE LA TABLA) */}
            <div className="auditoria-timeline-wrapper-container" style={{ marginTop: "20px" }}>
                <AuditoriaTimeline
                    movimientos={movimientosFiltrados}
                    onVerDetalle={handleVerDetalle}
                />
            </div>
        </div>
    );
}

export default Auditoria;