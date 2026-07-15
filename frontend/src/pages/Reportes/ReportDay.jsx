import { useState, useEffect } from "react";
import {
    ventasService
} from "../../services/ventasService"; // Ajusta la ruta según tu proyecto
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar
} from "recharts";
import {
    DollarSign,
    TrendingUp,
    ShoppingBag,
    CreditCard,
    Calendar,
    Loader2
} from "lucide-react";
import "./ReportDay.css";

function ReportDays() {
    // Inicializar con la fecha local de hoy en formato YYYY-MM-DD
    const getTodayString = () => {
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const localToday = new Date(today.getTime() - (offset * 60 * 1000));
        return localToday.toISOString().split("T")[0];
    };

    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [loading, setLoading] = useState(false);

    // Estados de datos procesados
    const [kpis, setKpis] = useState({ totalIngresos: 0, transacciones: 0, ticketPromedio: 0, efectivovsQr: {} });
    const [timelineData, setTimelineData] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);
    const [brandsData, setBrandsData] = useState([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchDailyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const fetchDailyData = async () => {
        try {
            setLoading(true);
            // 1. Obtener todas las cabeceras de ventas
            const responseAll = await ventasService.getAll();
            if (!responseAll?.success) throw new Error("Error al obtener ventas");

            // 2. Filtrar por la fecha seleccionada (comparando año-mes-día)
            const salesOfTheDay = responseAll.data.filter(sale => {
                if (!sale.estado) return false; // Solo ventas activas
                const saleDateStr = sale.fecha.split("T")[0];
                return saleDateStr === selectedDate;
            });

            // 3. Obtener el detalle extendido de cada venta del día mediante getById
            const detailsPromises = salesOfTheDay.map(sale => ventasService.getById(sale.id));
            const detailsResponses = await Promise.all(detailsPromises);

            const fullSalesData = detailsResponses
                .filter(res => res?.success)
                .map(res => res.data);

            processReportData(salesOfTheDay, fullSalesData);
        } catch (error) {
            console.error("Error generando el reporte diario:", error);
        } finally {
            setLoading(false);
        }
    };

    const processReportData = (headers, fullDetails) => {
        let total = 0;
        let paymentTypes = {};

        // Estructura base para el histograma de 24 horas (líneas finas)
        const hourlyMap = {};
        for (let i = 8; i <= 22; i++) {
            const hourStr = `${String(i).padStart(2, "0")}:00`;
            hourlyMap[hourStr] = { hora: hourStr, Total: 0, EFECTIVO: 0, QR: 0 };
        }

        // Procesar Cabeceras (Totales y Tiempo) - ¡CORREGIDO AQUÍ!
        headers.forEach(sale => {
            const saleTotal = parseFloat(sale.total) || 0;
            total += saleTotal;

            // Agrupación por tipo de pago
            const typeName = sale.tipoPago?.nombre || "OTRO";
            paymentTypes[typeName] = (paymentTypes[typeName] || 0) + saleTotal;

            // Agrupación por horas (Bloques de 08:00 a 22:00)
            const hour = new Date(sale.fecha).getHours();
            if (hour >= 8 && hour <= 22) {
                const hourKey = `${String(hour).padStart(2, "0")}:00`;
                if (hourlyMap[hourKey]) {
                    hourlyMap[hourKey].Total += saleTotal;
                    // Asegurar que si el tipo de pago es EFECTIVO o QR se sume dinámicamente
                    if (typeName === "EFECTIVO" || typeName === "QR") {
                        hourlyMap[hourKey][typeName] = (hourlyMap[hourKey][typeName] || 0) + saleTotal;
                    }
                }
            }
        }); // <-- Aquí se cierra correctamente el headers.forEach()

        // Procesar Detalles (Categorías y Marcas)
        const categoryMap = {};
        const brandMap = {};

        fullDetails.forEach(sale => {
            if (!sale.detalles) return;
            sale.detalles.forEach(det => {
                const cantidad = parseInt(det.cantidad) || 0;
                const subtotal = parseFloat(det.subtotal) || 0;

                const catName = det.producto?.categoria?.nombre || "SIN CATEGORÍA";
                const brandName = det.producto?.marca?.nombre || "SIN MARCA";

                categoryMap[catName] = (categoryMap[catName] || 0) + subtotal;
                brandMap[brandName] = (brandMap[brandName] || 0) + cantidad;
            });
        });

        // Formatear datos para Recharts
        const formattedTimeline = Object.values(hourlyMap);

        const formattedCategories = Object.keys(categoryMap).map(key => ({
            name: key,
            Valor: categoryMap[key]
        })).sort((a, b) => b.Valor - a.Valor);

        const formattedBrands = Object.keys(brandMap).map(key => ({
            name: key,
            Cantidad: brandMap[key]
        })).sort((a, b) => b.Cantidad - a.Cantidad).slice(0, 5);

        // Guardar Estados
        setKpis({
            totalIngresos: total,
            transacciones: headers.length,
            ticketPromedio: headers.length > 0 ? (total / headers.length) : 0,
            efectivovsQr: paymentTypes
        });
        setTimelineData(formattedTimeline);
        setCategoriesData(formattedCategories);
        setBrandsData(formattedBrands);
    };

    const handleQuickDate = (daysOffset) => {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        setSelectedDate(localDate.toISOString().split("T")[0]);
    };

    return (
        <div className="report-container">
            {/* Encabezado y Filtros */}
            <div className="report-header">
                <div className="report-title-section">
                    <h1>Movimiento Diario</h1>
                    <p>Monitoreo analítico de ventas y rendimiento en tiempo real</p>
                </div>

                <div className="report-filters">
                    <div className="quick-buttons">
                        <button
                            className={`btn-quick ${selectedDate === getTodayString() ? 'active' : ''}`}
                            onClick={() => handleQuickDate(0)}
                        >
                            Hoy
                        </button>
                        <button className="btn-quick" onClick={() => handleQuickDate(-1)}>Ayer</button>
                    </div>
                    <div className="date-input-wrapper">
                        <Calendar size={16} className="date-icon" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="date-picker"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="report-loader">
                    <Loader2 className="spinner" size={40} />
                    <p>Procesando y consolidando métricas diarias...</p>
                </div>
            ) : (
                <>
                    {/* Fila de KPIs */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-content">
                                <span>Ingreso Total</span>
                                <h3>Bs. {kpis.totalIngresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>
                            </div>
                            <div className="kpi-icon icon-income">
                                <DollarSign size={20} />
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-content">
                                <span>Transacciones</span>
                                <h3>{kpis.transacciones} vtas.</h3>
                            </div>
                            <div className="kpi-icon icon-orders">
                                <ShoppingBag size={20} />
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-content">
                                <span>Ticket Promedio</span>
                                <h3>Bs. {kpis.ticketPromedio.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>
                            </div>
                            <div className="kpi-icon icon-average">
                                <TrendingUp size={20} />
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-content">
                                <span>Efectivo / QR</span>
                                <div className="kpi-split">
                                    <span className="split-item text-success">EF: Bs. {kpis.efectivovsQr["EFECTIVO"] || 0}</span>
                                    <span className="split-item text-info">QR: Bs. {kpis.efectivovsQr["QR"] || 0}</span>
                                </div>
                            </div>
                            <div className="kpi-icon icon-payment">
                                <CreditCard size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Gráfico Principal: Histograma lineal muy fino */}
                    <div className="chart-main-card">
                        <div className="chart-header">
                            <h4>Flujo de Caja por Horas</h4>
                            <p>Trazado extra fino del rendimiento financiero y método de pago durante el día</p>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="var(--color-background)" strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="hora"
                                        tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--color-surface)",
                                            borderRadius: "var(--radius-md)",
                                            borderColor: "var(--color-border)",
                                            fontSize: "var(--font-size-sm)"
                                        }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                    {/* Línea Fina Principal - Total General */}
                                    <Line
                                        type="monotone"
                                        dataKey="Total"
                                        stroke="var(--color-secondary)"
                                        strokeWidth={1.2}
                                        dot={{ r: 2, strokeWidth: 1 }}
                                        activeDot={{ r: 4 }}
                                    />
                                    {/* Línea Fina - Efectivo */}
                                    <Line
                                        type="monotone"
                                        dataKey="EFECTIVO"
                                        stroke="var(--color-success)"
                                        strokeWidth={1}
                                        dot={false}
                                        strokeDasharray="4 4"
                                    />
                                    {/* Línea Fina - QR */}
                                    <Line
                                        type="monotone"
                                        dataKey="QR"
                                        stroke="var(--color-info)"
                                        strokeWidth={1}
                                        dot={false}
                                        strokeDasharray="4 4"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sección Inferior de Dos Columnas */}
                    <div className="report-secondary-grid">
                        {/* Categorías más vendidas (Monetario) */}
                        <div className="chart-secondary-card">
                            <div className="chart-header">
                                <h4>Ventas por Categoría</h4>
                                <p>Distribución de ingresos monetarios por departamento</p>
                            </div>
                            <div className="chart-wrapper">
                                {categoriesData.length === 0 ? (
                                    <div className="no-data-msg">No hay registros de categorías hoy.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={categoriesData} layout="vertical" margin={{ top: 5, right: 20, left: 15, bottom: 5 }}>
                                            <CartesianGrid stroke="var(--color-background)" horizontal={false} vertical={true} />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-text)" }} />
                                            <Tooltip contentStyle={{ fontSize: 12 }} />
                                            <Bar dataKey="Valor" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={12} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Top Marcas en volumen física de piezas */}
                        <div className="chart-secondary-card">
                            <div className="chart-header">
                                <h4>Top 5 Marcas del Día</h4>
                                <p>Rendimiento basado en volumen de prendas/piezas vendidas</p>
                            </div>
                            <div className="chart-wrapper">
                                {brandsData.length === 0 ? (
                                    <div className="no-data-msg">No hay registros de productos hoy.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={brandsData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid stroke="var(--color-background)" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                            <Tooltip contentStyle={{ fontSize: 12 }} />
                                            <Bar dataKey="Cantidad" fill="var(--color-secondary-light)" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ReportDays;