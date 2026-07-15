import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Layers, ArrowUpRight, ArrowDownLeft, Search, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

import { kardexService } from "../../services/kardexService.js";
import Button from "../../components/Button/Button";

import "./DetailKardex.css";
import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import KardexResumen from "../../components/Kardex/KardexResumen.jsx";
import KardexTimeline from "../../components/Kardex/KardexTimeline.jsx";

function DetailKardex() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [kardexData, setKardexData] = useState(null);

    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [movimientosFiltrados, setMovimientosFiltrados] = useState([]);

    useEffect(() => {
        const fetchKardex = async () => {
            try {
                setLoading(true);
                const response = await kardexService.getByProducto(id);

                if (response.success && response.data) {
                    setKardexData(response.data);
                    // Orden cronológico inicial (Últimos movimientos arriba)
                    const ordenados = [...response.data.movimientos].sort(
                        (a, b) => new Date(b.fecha) - new Date(a.fecha)
                    );
                    setMovimientosFiltrados(ordenados);
                } else {
                    setError(response.message || "No se pudo obtener el Kardex.");
                }
            } catch (err) {
                console.error(err);
                setError("Error de conexión con el servidor.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchKardex();
    }, [id]);

    const handleFiltrar = () => {
        if (!kardexData) return;

        let filtrados = [...kardexData.movimientos];

        if (fechaDesde) {
            const inicio = new Date(fechaDesde + "T00:00:00");
            filtrados = filtrados.filter(mov => new Date(mov.fecha) >= inicio);
        }

        if (fechaHasta) {
            const fin = new Date(fechaHasta + "T23:59:59");
            filtrados = filtrados.filter(mov => new Date(mov.fecha) <= fin);
        }

        filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setMovimientosFiltrados(filtrados);
    };

    const handleLimpiarFiltros = () => {
        setFechaDesde("");
        setFechaHasta("");
        if (kardexData) {
            const ordenados = [...kardexData.movimientos].sort(
                (a, b) => new Date(b.fecha) - new Date(a.fecha)
            );
            setMovimientosFiltrados(ordenados);
        }
    };

    const handleRowClick = (movimiento) => {
        Swal.fire({
            title: `<span style="font-size: var(--font-size-xl); font-weight: var(--font-semibold);">Detalle de Transacción</span>`,
            html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: var(--space-sm); font-size: var(--font-size-sm);">
          <p><strong>Documento:</strong> ${movimiento.documento.codigo} (#${movimiento.documento.numero})</p>
          <p><strong>Tipo:</strong> <span style="color: ${movimiento.tipoMovimiento.naturaleza === 'ENTRADA' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: bold;">${movimiento.tipoMovimiento.nombre}</span></p>
          <p><strong>Fecha:</strong> ${new Date(movimiento.fecha).toLocaleString()}</p>
          <p><strong>Personal:</strong> ${movimiento.usuario.nombre}</p>
          <p><strong>Origen/Destino:</strong> ${movimiento.cliente.nombre}</p>
          <p><strong>Cantidad:</strong> ${movimiento.cantidad} ${kardexData.producto.unidad}(s)</p>
          <p><strong>Flujo:</strong> ${movimiento.stockAnterior} → <strong>${movimiento.stockNuevo}</strong></p>
          <hr style="border: 0; border-top: 1px solid var(--color-border); margin: var(--space-sm) 0;" />
          <p><strong>Observación:</strong> <span style="font-style: italic; color: var(--color-text-light);">${movimiento.observacion || 'Sin observaciones'}</span></p>
        </div>
      `,
            icon: "info",
            confirmButtonText: "Entendido",
            confirmButtonColor: "var(--color-primary)",
        });
    };

    if (loading) {
        return (
            <div className="detail-kardex-center">
                <RefreshCw className="detail-kardex-spinner" size={40} />
                <p>Cargando historial del Kardex...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detail-kardex-center">
                <p className="detail-kardex-error">{error}</p>
                <Button onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />}>Regresar</Button>
            </div>
        );
    }

    const { producto, resumen } = kardexData;

    return (
        <div className="page-container">
            {/* SECCIÓN ACCIONES Y DASHBOARD CARDS */}
            <div className="detail-kardex-header-actions">
                <div className="detail-kardex-title-area">
                    <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />}>
                        Volver
                    </Button>
                    <div>
                        <h1 className="detail-kardex-main-title">Kardex del Artículo</h1>
                        <p className="detail-kardex-subtitle">Registro centralizado de entradas y salidas</p>
                    </div>
                </div>

                {/* Uso Dinámico de tus DashboardCards */}
                <div className="detail-kardex-kpi-grid">
                    <DashboardCard
                        title="Stock Físico"
                        value={producto.stockActual}
                        icon={Layers}
                        status="info"
                    />
                    <DashboardCard
                        title="Ingresos Totales"
                        value={resumen.totalEntradas}
                        icon={ArrowUpRight}
                        status="success"
                    />
                    <DashboardCard
                        title="Egresos Totales"
                        value={resumen.totalSalidas}
                        icon={ArrowDownLeft}
                        status="danger"
                    />
                </div>
            </div>

            {/* COMPONENTE FICHA RESUMEN */}
            <KardexResumen producto={producto} />

            {/* FILTROS DE HISTORIAL */}
            <div className="detail-kardex-filter-card">
                <div className="detail-kardex-filter-title-group">
                    <Calendar size={18} />
                    <h3 className="detail-kardex-filter-title">Filtro de Rangos de Fecha</h3>
                </div>
                <div className="detail-kardex-filter-flex">
                    <div className="detail-kardex-input-wrapper">
                        <label className="detail-kardex-input-label">Desde</label>
                        <input
                            type="date"
                            className="detail-kardex-date-input"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                        />
                    </div>
                    <div className="detail-kardex-input-wrapper">
                        <label className="detail-kardex-input-label">Hasta</label>
                        <input
                            type="date"
                            className="detail-kardex-date-input"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                        />
                    </div>
                    <div className="detail-kardex-filter-buttons">
                        <Button onClick={handleFiltrar} icon={<Search size={16} />}>
                            Filtrar
                        </Button>
                        <Button variant="secondary" onClick={handleLimpiarFiltros}>
                            Limpiar
                        </Button>
                    </div>
                </div>
            </div>

            {/* COMPONENTE HISTORIAL TIMELINE */}
            <KardexTimeline
                movimientos={movimientosFiltrados}
                unidad={producto.unidad}
                onRowClick={handleRowClick}
            />
        </div>
    );
}

export default DetailKardex;