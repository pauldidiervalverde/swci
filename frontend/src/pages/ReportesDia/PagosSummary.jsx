import { CreditCard, Wallet, QrCode, HandCoins } from "lucide-react";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import "./PagosSummary.css";

const CONFIG_PAGOS = [
    { key: "EFECTIVO", label: "EFECTIVO", icon: HandCoins, color: "success" },
    { key: "QR", label: "QR", icon: QrCode, color: "yape" },
    { key: "TARJETA", label: "TARJETA", icon: CreditCard, color: "info" }
];

function PagosSummary({ graficos }) {
    const totalesPorTipo = graficos?.totalesPorTipoPago || [];

    // Verificamos si el día cuenta con alguna venta registrada en general
    const tieneVentasHoy = totalesPorTipo.some(p => Number(p.total) > 0);

    return (
        <div className="pagos-summary-stack">

            {/* Tarjeta de Título Principal */}
            <DashboardCard
                title="Monitoreo de Caja"
                value={tieneVentasHoy ? "Tipos de Pago" : "Sin Movimiento"}
                icon={Wallet}
                status={tieneVentasHoy ? "info" : "inactive"}
            />

            {/* Mapeo de las Tres Tarjetas de Métodos de Pago */}
            {CONFIG_PAGOS.map((metodo) => {
                // Buscamos el monto en los datos que vienen del backend
                const datoBackend = totalesPorTipo.find(
                    p => p.tipo.toUpperCase() === metodo.key
                );
                const monto = Number(datoBackend?.total || 0);

                // Si el monto es mayor a 0 y hay ventas, la tarjeta está activa
                const CardActiva = tieneVentasHoy && monto > 0;

                return (
                    <DashboardCard
                        key={metodo.key}
                        title={`${metodo.label}`}
                        value={CardActiva ? monto.toLocaleString("es-BO", { minimumFractionDigits: 2 }) : "0.00"}
                        prefix="Bs."
                        icon={metodo.icon}
                        status={CardActiva ? metodo.color : "inactive"}
                    />
                );
            })}

        </div>
    );
}

export default PagosSummary;