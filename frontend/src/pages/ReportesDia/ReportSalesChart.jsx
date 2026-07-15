import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CreditCard, HelpCircle, QrCode, HandCoins } from "lucide-react";
import "./ReportSalesChart.css";

const CONFIG_PAGOS = {
    EFECTIVO: { icono: HandCoins, color: "#04850a" },
    QR: { icono: QrCode, color: "#b002d3" },
    TARJETA: { icono: CreditCard, color: "#2420e6" }
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        if (data.total === 0 || data.isFake) return null;

        return (
            <div className="custom-chart-tooltip">
                <p className="tooltip-time">Hora Registro: {data.horaReal}</p>
                <div className="tooltip-divider" />
                <p className="tooltip-row"><strong>Monto Total:</strong> Bs. {Number(data.total).toFixed(2)}</p>
                <p className="tooltip-row"><strong>Productos:</strong> {data.productos} uds</p>
                <p className="tooltip-row">
                    <strong>Pago:</strong>{" "}
                    <span className="tooltip-method-tag" style={{ backgroundColor: `${data.pagoColor}70`, color: "white" }}>
                        {data.tipoPago}
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

const RenderPagoIcono = (props) => {
    const { cx, cy, payload } = props;
    if (!payload || payload.total === 0 || payload.isFake) return null;

    const config = CONFIG_PAGOS[payload.tipoPago?.toUpperCase()] || { icono: HelpCircle, color: "var(--color-text)" };
    const IconoComponente = config.icono;

    return (
        <svg x={cx - 18} y={cy - 35} width="36" height="36" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="var(--color-surface)" stroke={config.color} strokeWidth="1" />
            <g transform="translate(5, 5)" color={config.color}>
                <IconoComponente size={15} />
            </g>
        </svg>
    );
};

function ReportSalesChart({ ventas }) {
    // if (loading) return <div className="chart-skeleton">Procesando transacciones...</div>;

    const datosCronologicos = [{ hora: "08:00", total: 0, isFake: true }];

    const ventasOrdenadas = [...(ventas || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    let ultimoTiempoAsignado = null;

    ventasOrdenadas.forEach((v) => {
        let fechaVenta = new Date(v.fecha);

        if (ultimoTiempoAsignado) {
            const diferenciaMinutos = (fechaVenta.getTime() - ultimoTiempoAsignado.getTime()) / 60000;
            if (diferenciaMinutos < 15) {
                fechaVenta = new Date(ultimoTiempoAsignado.getTime() + 15 * 60000);
            }
        }
        ultimoTiempoAsignado = fechaVenta;

        const horaRealStr = new Date(v.fecha).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
        const horaGraficoStr = fechaVenta.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
        const cantProductos = v.detalles?.reduce((sum, d) => sum + (d.cantidad || 0), 0) || 0;
        const tipoPagoNom = v.tipoPago?.nombre || "EFECTIVO";
        const pagoColor = CONFIG_PAGOS[tipoPagoNom.toUpperCase()]?.color || "#444d5f";

        const fechaSubida = new Date(fechaVenta.getTime() - 60000);
        datosCronologicos.push({
            hora: fechaSubida.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }),
            total: 0,
            isFake: true
        });

        datosCronologicos.push({
            hora: horaGraficoStr,
            horaReal: horaRealStr,
            total: Number(v.total || 0),
            productos: cantProductos,
            tipoPago: tipoPagoNom,
            pagoColor,
            isFake: false
        });

        const fechaCaida = new Date(fechaVenta.getTime() + 60000);
        datosCronologicos.push({
            hora: fechaCaida.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }),
            total: 0,
            isFake: true
        });
    });

    datosCronologicos.push({ hora: "22:00", total: 0, isFake: true });

    return (
        <div className="chart-wrapper-full">
            <h4 className="chart-card__title">Histograma de Ventas por Día</h4>
            <p className="chart-card__subtitle">Picos de ventas y totales (08:00 am - 10:00 pm)</p>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={datosCronologicos} margin={{ top: 35, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorImpulso" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.15} />
                    <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "var(--color-text-muted)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--color-text-light)" }} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Area type="linear" dataKey="total" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#colorImpulso)" dot={<RenderPagoIcono />} activeDot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ReportSalesChart;