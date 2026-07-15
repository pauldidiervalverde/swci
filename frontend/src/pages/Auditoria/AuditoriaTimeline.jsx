//import React from "react";
import { Eye, ArrowUpRight, ArrowDownLeft, ShoppingBag, User } from "lucide-react";
import { formatFechaCorta, formatHora } from "../../utils/normalizarHora.js"
import "./AuditoriaTimeline.css";

function AuditoriaTimeline({ movimientos, onVerDetalle }) {

    // Retorna un ícono y una clase según el tipo de movimiento
    const getTimelineConfig = (mov) => {
        const nombre = mov.tipoMovimiento?.nombre;
        const naturaleza = mov.tipoMovimiento?.naturaleza;

        if (nombre === "VENTA") {
            return { icon: <ShoppingBag size={16} />, className: "timeline-item--venta" };
        }
        if (naturaleza === "ENTRADA") {
            return { icon: <ArrowDownLeft size={16} />, className: "timeline-item--ingreso" };
        }
        return { icon: <ArrowUpRight size={16} />, className: "timeline-item--salida" };
    };

    if (movimientos.length === 0) {
        return (
            <div className="timeline-empty">
                No se encontraron transacciones en la línea de tiempo bajo los filtros seleccionados.
            </div>
        );
    }

    return (
        <div className="auditoria-timeline-container">
            <div className="timeline-line"></div>

            {movimientos.map((mov) => {
                const { icon, className } = getTimelineConfig(mov);
                const esEntrada = mov.tipoMovimiento?.naturaleza === "ENTRADA";

                return (
                    <div key={mov.id} className={`timeline-item ${className}`}>
                        {/* Nodo/Burbuja con el Icono */}
                        <div className="timeline-node">
                            {icon}
                        </div>

                        {/* Contenido de la tarjeta */}
                        <div className="timeline-content-card">
                            <div className="timeline-card-header">
                                <span className="timeline-time">
                                    <strong>{formatFechaCorta(mov.fecha)}</strong> - {formatHora(mov.fecha)}
                                </span>
                                <span className="timeline-doc-code">{mov.documento?.codigo || "N/A"}</span>
                            </div>

                            <div className="timeline-card-body">
                                <div className="timeline-product-info">
                                    <p className="product-title">
                                        <strong>#{mov.producto?.codigo}</strong> {mov.producto?.descripcion}
                                    </p>
                                    <p className="product-specs">
                                        Marca: <span>{mov.producto?.marca}</span> | Talla: <span>{mov.producto?.tallas}</span> | Color: <span>{mov.producto?.color}</span>
                                    </p>
                                </div>

                                <div className="timeline-metrics">
                                    <span className={`timeline-quantity ${esEntrada ? "qty-in" : "qty-out"}`}>
                                        {esEntrada ? `+${mov.amount || mov.cantidad}` : `-${mov.amount || mov.cantidad}`}
                                    </span>
                                    <span className="timeline-badge-type">
                                        {mov.tipoMovimiento?.nombre}
                                    </span>
                                </div>
                            </div>

                            <div className="timeline-card-footer">
                                <span className="timeline-user">
                                    <User size={12} /> {mov.usuario?.nombre}
                                </span>
                                <button
                                    type="button"
                                    className="timeline-action-btn"
                                    onClick={() => onVerDetalle(mov)}
                                >
                                    <Eye size={14} /> Detalles
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default AuditoriaTimeline;