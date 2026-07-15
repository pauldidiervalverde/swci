
import { FileText } from "lucide-react";
import "./KardexTimeline.css";

function KardexTimeline({ movimientos, onRowClick }) {
    const formatFecha = (isoString) => {
        return new Date(isoString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="kardex-tl-card">
            <div className="kardex-tl-header-section">
                <h2 className="kardex-tl-title">Historial de Movimientos de Almacén</h2>
                <span className="kardex-tl-badge-count">
                    {movimientos.length} transacciones encontradas
                </span>
            </div>

            <div className="kardex-tl-responsive-container">
                {movimientos.length === 0 ? (
                    <div className="kardex-tl-empty-state">
                        <FileText size={48} className="kardex-tl-empty-icon" />
                        <p>No se encontraron movimientos con los criterios seleccionados.</p>
                    </div>
                ) : (
                    <table className="kardex-tl-table">
                        <thead>
                            <tr>
                                <th className="kardex-tl-th">Fecha / Hora</th>
                                <th className="kardex-tl-th">Documento Nro</th>
                                <th className="kardex-tl-th">Tipo Operación</th>
                                <th className="kardex-tl-th">Responsable / Destino</th>
                                <th className="kardex-tl-th text-right">Entrada</th>
                                <th className="kardex-tl-th text-right">Salida</th>
                                <th className="kardex-tl-th text-right">Saldo Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((mov) => {
                                const isEntrada = mov.tipoMovimiento.naturaleza === "ENTRADA";
                                return (
                                    <tr
                                        key={mov.id}
                                        className="kardex-tl-tr"
                                        onClick={() => onRowClick?.(mov)}
                                    >
                                        <td className="kardex-tl-td">{formatFecha(mov.fecha)}</td>
                                        <td className="kardex-tl-td">
                                            <span className="kardex-tl-doc-code">{mov.documento.codigo}</span>
                                        </td>
                                        <td className="kardex-tl-td">
                                            <span className={`kardex-tl-badge-nature ${isEntrada ? "entrada" : "salida"}`}>
                                                {mov.tipoMovimiento.nombre}
                                            </span>
                                        </td>
                                        <td className="kardex-tl-td">
                                            <div className="kardex-tl-client-name">{mov.cliente.nombre}</div>
                                            <div className="kardex-tl-subtext-user">Reg: {mov.usuario.nombre}</div>
                                        </td>
                                        <td className={`kardex-tl-td text-right numeric-col ${isEntrada ? "text-success" : "text-muted"}`}>
                                            {mov.entrada > 0 ? `+${mov.entrada}` : "-"}
                                        </td>
                                        <td className={`kardex-tl-td text-right numeric-col ${!isEntrada ? "text-danger" : "text-muted"}`}>
                                            {mov.salida > 0 ? `-${mov.salida}` : "-"}
                                        </td>
                                        <td className="kardex-tl-td text-right numeric-col font-bold primary-color">
                                            {mov.saldo}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default KardexTimeline;