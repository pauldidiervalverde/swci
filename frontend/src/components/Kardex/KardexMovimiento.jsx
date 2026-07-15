import "./KardexMovimiento.css";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    CalendarDays,
    User,
    FileText,
    MessageSquare,
    Package,
    ChevronRight,
} from "lucide-react";
import { obtenerFechaBolivia } from "../../utils/normalizarHora";
function KardexMovimiento({ movimiento }) {
    const entrada = movimiento.tipoMovimiento.naturaleza === "ENTRADA";
    return (
        <article
            className={`kardex-movimiento ${entrada ? "entrada" : "salida"}`}
        >
            <div className="kardex-movimiento__linea" />
            <div className="kardex-movimiento__icono">
                {entrada ? (
                    <ArrowDownCircle size={24} />
                ) : (
                    <ArrowUpCircle size={24} />
                )}
            </div>
            <div className="kardex-movimiento__contenido">
                <div className="kardex-movimiento__cabecera">
                    <div className="kardex-movimiento__fecha">
                        <CalendarDays size={15} />
                        <span>
                            {obtenerFechaBolivia(movimiento.fecha)}
                        </span>
                    </div>
                    <div
                        className={`kardex-movimiento__tipo ${entrada ? "entrada" : "salida"
                            }`}
                    >
                        {movimiento.tipoMovimiento.nombre}
                    </div>
                </div>
                <div className="kardex-movimiento__grid">
                    <div>
                        <label>Documento</label>
                        <span>
                            <FileText size={15} />
                            {movimiento.documento.codigo}
                        </span>
                    </div>
                    <div>
                        <label>Cliente</label>
                        <span>
                            <User size={15} />
                            {movimiento.cliente?.nombre || "-"}
                        </span>
                    </div>
                    <div>
                        <label>Usuario</label>
                        <span>
                            <User size={15} />
                            {movimiento.usuario.nombre}
                        </span>
                    </div>
                    <div>
                        <label>Cantidad</label>
                        <span
                            className={
                                entrada
                                    ? "valor-entrada"
                                    : "valor-salida"
                            }
                        >
                            {entrada
                                ? `+${movimiento.entrada}`
                                : `-${movimiento.salida}`}
                        </span>
                    </div>
                    <div>
                        <label>Stock</label>
                        <span>
                            {movimiento.stockAnterior}
                            <ChevronRight size={15} />
                            <strong>
                                {movimiento.stockNuevo}
                            </strong>
                        </span>
                    </div>
                    <div>
                        <label>Saldo</label>
                        <span className="saldo">
                            <Package size={15} />
                            {movimiento.saldo}
                        </span>
                    </div>
                </div>
                {movimiento.observacion && (
                    <div className="kardex-movimiento__observacion">
                        <MessageSquare size={15} />
                        <span>{movimiento.observacion}</span>
                    </div>
                )}
            </div>
        </article>
    );
}
export default KardexMovimiento;