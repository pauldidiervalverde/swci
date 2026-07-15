import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import { Wallet, DollarSign, QrCode, CreditCard, ShoppingBag } from 'lucide-react';
import './ReportDay.css'; // Asegúrate de tener tus estilos estilizados

// Componente para pintar etiquetas personalizadas justo encima del pico/nodo de la gráfica
const CustomLabel = (props) => {
    const { x, y, value, payload } = props;
    if (!payload) return null;

    return (
        <g transform={`translate(${x},${y - 12})`}>
            <text
                textAnchor="middle"
                fill="#1e293b"
                fontSize={11}
                fontWeight="bold"
                className="bg-white filter drop-shadow-sm"
            >
                {`${value} Bs.`}
            </text>
            <text
                textAnchor="middle"
                fill="#64748b"
                fontSize={9}
                y={12}
            >
                {`(${payload.tipoPago} - ${payload.cantidadProductos} pzs)`}
            </text>
        </g>
    );
};

// Componente de Tooltip personalizado para cuando pasen el mouse por encima
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl text-xs text-slate-700">
                <p className="font-bold text-slate-900 border-b pb-1 mb-1">Venta #{data.numero} ({data.hora})</p>
                <p><span className="font-semibold text-indigo-600">Monto:</span> {data.monto} Bs.</p>
                <p><span className="font-semibold text-slate-600">Pago:</span> {data.tipoPago}</p>
                <p><span className="font-semibold text-slate-600">Artículos:</span> {data.cantidadProductos} unidades</p>
                <p className="text-[10px] text-slate-400 mt-1">Código: {data.codigo}</p>
            </div>
        );
    }
    return null;
};

export default function ReporteDiarioVentas({ apiResponse }) {
    // 1. PROCESAMIENTO DE DATOS
    const { totalGeneral, datosGrafico, tarjetasActivas } = useMemo(() => {
        if (!apiResponse || !apiResponse.success || !apiResponse.data) {
            return { totalGeneral: 0, datosGrafico: [], tarjetasActivas: [] };
        }

        let sumaGeneral = 0;
        const resumenPagos = {};

        // Mapeamos y extraemos lo necesario de cada venta
        const ventasProcesadas = apiResponse.data.map(venta => {
            const montoVenta = parseFloat(venta.total || 0);
            sumaGeneral += montoVenta;

            // Agrupar totales por tipo de pago para las tarjetas
            const nombrePago = venta.tipoPago?.nombre || `ID: ${venta.tipoPagoId}`;
            if (!resumenPagos[nombrePago]) {
                resumenPagos[nombrePago] = 0;
            }
            resumenPagos[nombrePago] += montoVenta;

            // Calcular la cantidad de productos totales comprados en esta venta concreta
            const totalProductos = venta.detalles
                ? venta.detalles.reduce((acc, det) => acc + parseInt(det.cantidad || 0), 0)
                : 1; // Si no hay detalle estructurado, asumimos al menos 1 transacción

            // Extraer hora legible HH:MM desde la fecha ISO
            const fechaObj = new Date(venta.fecha);
            const horaLegible = fechaObj.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            return {
                id: venta.id,
                numero: venta.numero,
                codigo: venta.codigo,
                timestamp: fechaObj.getTime(), // Para ordenar cronológicamente
                hora: horaLegible,
                monto: montoVenta,
                tipoPago: nombrePago,
                cantidadProductos: totalProductos
            };
        });

        // Ordenamos las ventas de menor a mayor hora para que la línea del gráfico tenga sentido fluido
        const graficoOrdenado = ventasProcesadas.sort((a, b) => a.timestamp - b.timestamp);

        // Convertir el objeto de pagos en un array y FILTRAR solo los que tengan ventas > 0
        const listaTarjetas = Object.keys(resumenPagos)
            .map(tipo => ({
                tipo,
                total: resumenPagos[tipo]
            }))
            .filter(tarjeta => tarjeta.total > 0); // No muestra los que están en cero o no existen

        return {
            totalGeneral: sumaGeneral,
            datosGrafico: graficoOrdenado,
            tarjetasActivas: listaTarjetas
        };
    }, [apiResponse]);

    // Función auxiliar para asignar iconos dinámicos a cada tarjeta de pago
    const getIcon = (tipo) => {
        const t = tipo.toLowerCase();
        if (t.includes('efectivo')) return <DollarSign className="w-5 h-5 text-emerald-600" />;
        if (t.includes('qr')) return <QrCode className="w-5 h-5 text-blue-600" />;
        if (t.includes('tarjeta')) return <CreditCard className="w-5 h-5 text-purple-600" />;
        return <Wallet className="w-5 h-5 text-slate-600" />;
    };

    if (datosGrafico.length === 0) {
        return <div className="p-6 text-center text-slate-500">No hay movimientos registrados para el día de hoy.</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
            {/* ENCABEZADO */}
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Movimiento Diario de Ventas</h1>
                    <p className="text-xs text-slate-500">Reporte dinámico en tiempo real basado en ventas concretas</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Ventas Totales Hoy</span>
                    <span className="text-lg font-black text-slate-900">{totalGeneral.toLocaleString()} Bs.</span>
                </div>
            </div>

            {/* SECCIÓN DE TARJETAS DINÁMICAS (Solo muestra los métodos con transacciones) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tarjetasActivas.map((tarjeta, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 block uppercase">Total {tarjeta.tipo}</span>
                            <span className="text-xl font-extrabold text-slate-800">{tarjeta.total.toLocaleString()} Bs.</span>
                        </div>
                        <div className="bg-slate-100 p-2.5 rounded-lg">
                            {getIcon(tarjeta.tipo)}
                        </div>
                    </div>
                ))}
            </div>

            {/* GRÁFICO LINEAL DE ALTA PRECISIÓN */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-indigo-500" />
                        Flujo de Transacciones por Hora Exacta
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">Cada punto representa una venta real ({datosGrafico.length} en total)</span>
                </div>

                <div className="h-80 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={datosGrafico}
                            margin={{ top: 25, right: 40, left: 10, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                            {/* Eje X muestra la hora exacta de la venta */}
                            <XAxis
                                dataKey="hora"
                                stroke="#94a3b8"
                                fontSize={11}
                                tickLine={false}
                                dy={10}
                            />

                            {/* Eje Y muestra los montos */}
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={11}
                                tickLine={false}
                                tickFormatter={(value) => `${value} Bs.`}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            {/* Línea ultrafina con etiquetas adjuntas directamente en sus picos */}
                            <Line
                                type="linear"
                                dataKey="monto"
                                stroke="#6366f1"
                                strokeWidth={1.5}
                                dot={{ r: 4, stroke: '#4f46e5', strokeWidth: 1.5, fill: '#ffffff' }}
                                activeDot={{ r: 6, fill: '#4f46e5' }}
                            >
                                <LabelList dataKey="monto" content={<CustomLabel />} />
                            </Line>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}