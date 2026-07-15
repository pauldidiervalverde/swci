import { Clock, ShoppingBag, Eye } from "lucide-react";
import Swal from "sweetalert2";
import "./ReportTimeline.css";

const CONFIG_ESTILOS_PAGO = {
    EFECTIVO: { color: "#16a34a", bg: "rgba(22, 163, 74, 0.08)" },
    QR: { color: "#1f2738", bg: "rgba(31, 39, 56, 0.08)" },
    TARJETA: { color: "#2563eb", bg: "rgba(37, 99, 233, 0.08)" }
};

function ReportTimeline({ ventas }) {

    const ventasCronologicas = [...(ventas || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Función para desplegar el SweetAlert2 con el desglose nativo del backend
    const manejarVerDetalles = (venta, hora) => {
        const tipoPago = venta.tipoPago?.nombre || "EFECTIVO";

        // Generar las filas de la tabla de productos dinámicamente
        const filasProductosHtml = venta.detalles?.map(d => {
            // 1. Usar 'descripcion' que es el campo real de tu modelo de producto en Prisma
            const nombreProducto = d.producto?.descripcion || "Prenda de Vestir";

            // 2. Extraer marca o codigo si existe usando tu relación
            //const marca = d.producto?.marca?.nombre || "";
            const codigo = d.producto?.codigo || "";
            const tituloMostrar = codigo ? `[ ${codigo} ]  ${nombreProducto}` : nombreProducto;

            // 3. Talla y color viven directamente en el detalle 'd' según tu estructura
            const talla = d.producto?.tallas || "S/T";
            const color = d.producto?.color || "S/C";

            const precio = Number(d.precioUnitario || d.precio || 0);
            const cantidad = Number(d.cantidad || 1);
            const subtotal = precio * cantidad;

            return `
        <tr>
            <td style="text-align: left; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div style="font-weight: 600; color: #111; font-size: 13px;">${tituloMostrar}</div>
                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    <span style="background: #e9e9eb; padding: 2px 6px; border-radius: 4px; margin-right: 4px; font-weight: 700; color: #000;">Talla: ${talla}</span> 
                    <span style="background: #e9e9eb; padding: 2px 6px; border-radius: 4px; font-weight: 700; color: #000;">Color: ${color}</span>
                </div>
            </td>
            <td style="text-align: center; color: #555; font-size: 13px; font-weight: 600;">${cantidad} u.</td>
            <td style="text-align: right; font-weight: 700; color: #000; font-size: 13px;">Bs. ${subtotal.toFixed(2)}</td>
        </tr>
    `;
        }).join('') || '<tr><td colspan="3" style="text-align:center; padding:20px; color:#999; font-style:italic;">Sin desglose de prendas en esta transacción</td></tr>';
        Swal.fire({
            title: `<span style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Comprobante de Caja</span>`,
            html: `
                <div style="text-align: left; font-family: sans-serif; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; background: #f8f9fa; padding: 10px; border-radius: 6px;">
                        <div><strong style="color: #666;">Hora:</strong> ${hora}</div>
                        <div><strong style="color: #666;">Pago:</strong> <span style="color: ${CONFIG_ESTILOS_PAGO[tipoPago.toUpperCase()]?.color || '#000'}; font-weight: bold;">${tipoPago}</span></div>
                    </div>
                    
                    <div style="margin: 15px 0 5px 0; font-weight: 700; color: #111; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Detalle de Prendas</div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #ddd; color: #666; font-size: 11px; text-transform: uppercase;">
                                <th style="text-align: left; padding-bottom: 5px;">Artículo</th>
                                <th style="text-align: center; padding-bottom: 5px; width: 60px;">Cant.</th>
                                <th style="text-align: right; padding-bottom: 5px; width: 80px;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasProductosHtml}
                        </tbody>
                    </table>

                    <div style="margin-top: 20px; border-top: 2px dashed #ccc; padding-top: 12px;">
                        ${venta.descuentoGlobal > 0 ? `
                            <div style="display: flex; justify-content: space-between; color: #e74c3c; font-size: 13px; margin-bottom: 4px;">
                                <span>Descuento Aplicado:</span>
                                <strong>-${Number(venta.descuentoGlobal).toFixed(0)}%</strong>
                            </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #000;">
                            <span>TOTAL COBRADO:</span>
                            <span>Bs. ${Number(venta.total || 0).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: 'var(--color-primary, #1f2738)',
            customClass: {
                popup: 'swal2-minimalist-popup'
            }
        });
    };

    return (
        <div className="timeline-main-container">
            <div className="timeline-header">
                <div className="timeline-header__title-block">
                    <Clock size={18} className="timeline-title-icon" />
                    <h4 className="timeline-title">Bitácora Cronológica de Caja</h4>
                </div>
                <span className="timeline-counter-badge">{ventasCronologicas.length} Operaciones</span>
            </div>

            <p className="timeline-subtitle">Flujo en tiempo real del registro de transacciones de hoy</p>

            <div className="timeline-stream">
                {ventasCronologicas.map((venta, index) => {
                    const horaFormateada = new Date(venta.fecha).toLocaleTimeString("es-BO", {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    const tipoPago = venta.tipoPago?.nombre || "EFECTIVO";
                    const estiloPago = CONFIG_ESTILOS_PAGO[tipoPago.toUpperCase()] || { color: "#7f8c8d", bg: "#f4f4f6" };
                    const totalUnidades = venta.detalles?.reduce((sum, d) => sum + (d.cantidad || 0), 0) || 0;

                    return (
                        <div key={venta.id || index} className="timeline-event-row">

                            <div className="timeline-time-column">
                                <span className="timeline-time-text">{horaFormateada}</span>
                            </div>

                            <div className="timeline-node-column">
                                <div className="timeline-node-line" />
                                <div
                                    className="timeline-node-dot"
                                    style={{ borderColor: estiloPago.color, backgroundColor: estiloPago.color }}
                                />
                            </div>

                            <div className="timeline-body-card">
                                <div className="timeline-card-left">
                                    <div className="timeline-tag-payment" style={{ backgroundColor: estiloPago.bg, color: estiloPago.color }}>
                                        {tipoPago}
                                    </div>
                                    <div className="timeline-details-preview">
                                        <ShoppingBag size={13} className="inline-icon" />
                                        <span>{totalUnidades} {totalUnidades === 1 ? 'prenda' : 'prendas'}</span>
                                        {venta.descuentoGlobal > 0 && (
                                            <span className="timeline-discount-pill">
                                                -{Number(venta.descuentoGlobal).toFixed(0)}% desc
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="timeline-card-right">
                                    <span className="timeline-amount-text">
                                        Bs. {Number(venta.total || 0).toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                                    </span>

                                    {/* Botón de acción directo y llamativo */}
                                    <button
                                        className="timeline-action-view-btn"
                                        title="Ver desglose de venta"
                                        onClick={() => manejarVerDetalles(venta, horaFormateada)}
                                    >
                                        <Eye size={14} />
                                        <span>Detalles</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    );
                })}

                {ventasCronologicas.length === 0 && (
                    <div className="timeline-empty-state">
                        <p>No se registran transacciones procesadas en el rango operativo actual.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportTimeline;