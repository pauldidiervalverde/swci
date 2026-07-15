import { DollarSign, ShoppingBag, Tag, Gift } from "lucide-react";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import "./ReportSummary.css";

function ReportSummary({ resumenMonetario, resumenSalidasInventario }) {
    if (!resumenMonetario || !resumenSalidasInventario) return null;

    // REGLA: Únicamente contabilizar salidas físicas sin costo de venta (Regalos + Intercambios)
    const salidasCostoCero =
        (Number(resumenSalidasInventario.unidadesPorRegalo) || 0) +
        (Number(resumenSalidasInventario.unidadesPorIntercambio) || 0);

    return (
        <div className="report-summary-clean">

            <DashboardCard
                title="Venta Total del Día"
                value={resumenMonetario.granTotalVendido.toLocaleString("es-BO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
                suffix=" Bs."
                icon={DollarSign}
                status="info"
            />
            <DashboardCard
                title="Ventas Realizadas"
                value={resumenMonetario.cantidadVentasActivas}
                suffix="ventas"
                icon={ShoppingBag}
                status="success"
            />
            <DashboardCard
                title="Descuentos Totales"
                value={resumenMonetario.totalDescuentosAplicados.toLocaleString("es-BO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
                suffix=" Bs."
                icon={Tag}
                status="warning"
            />
            <DashboardCard
                title="Salidas (Regalos/Canjes)"
                value={salidasCostoCero}
                suffix="prendas"
                icon={Gift}
                status="normal"
            />

        </div>
    );
}

export default ReportSummary;