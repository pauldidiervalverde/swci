import { useEffect, useState } from "react";

// import ReportHeader from "./ReportHeader";
import ReportFilters from "./ReportFilters";
import ReportSalesChart from "./ReportSalesChart";
import ReportSummary from "./ReportSummary";
import ReportTimeline from "./ReportTimeline";
import Swal from "sweetalert2";
import { useAuthStore } from "../../stores/authStore";
import { getToday } from "../../utils/normalizarHora";
import { reporteService } from "../../services/reporteService";
import PagosSummary from "./PagosSummary";
import "./ReportDay.css";

function ReportDay() {
    const tiendaActiva = useAuthStore((state) => state.tiendaActiva);
    // ===========================
    // Estados principales
    // ===========================
    // const [loading, setLoading] = useState(false);
    const [fecha, setFecha] = useState(getToday());
    const [reportData, setReportData] = useState(null);
    const handleToday = () => {
        setFecha(getToday());
    };
    const handlePrevious = () => {
        const d = new Date(`${fecha}T12:00:00`);
        d.setDate(d.getDate() - 1);
        setFecha(d.toISOString().split("T")[0]);
    };
    const handleNext = () => {
        const d = new Date(`${fecha}T12:00:00`);
        d.setDate(d.getDate() + 1);
        const nuevaFecha = d.toISOString().split("T")[0];
        if (nuevaFecha <= getToday()) {
            setFecha(nuevaFecha);
        }
    };

    // ===========================
    // Consulta principal
    // ===========================
    const cargarReporte = async () => {
        if (!fecha) return;
        Swal.fire({
            title: `Tienda ${tiendaActiva.nombre}`,
            html: "Generando reporte comercial diario...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        try {
            const fechaInicio = new Date(`${fecha}T00:00:00`);
            const fechaFin = new Date(`${fecha}T23:59:59`);
            const filtrosQuery = {
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString(),
            };
            const response = await reporteService.getReporteDiario(filtrosQuery);
            if (!response?.success) {
                throw new Error(response?.message || "No fue posible generar el reporte.");
            }
            setReportData(response.data);
            Swal.close();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No fue posible generar el reporte diario.",
                confirmButtonColor: "var(--color-primary)",
            });
        }
    };
    // ===========================
    // Efecto para Carga Automática
    // ===========================
    useEffect(() => {
        if (tiendaActiva?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            cargarReporte();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha, tiendaActiva?.id]); // Cada vez que cambies de día con las flechas
    return (
        <div className="page-container">

            <ReportFilters
                fecha={fecha}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onToday={handleToday}
                disableNext={fecha === getToday()}
            />
            <div className="report-wrapper-central-grid">

                {/* 1. GRÁFICO (Ocupa 6 columnas) */}
                <div className="wrapper-grid-item chart-area">
                    <ReportSalesChart ventas={reportData?.ventas} />
                </div>

                {/* 2. PAGOS DINÁMICOS (Ocupa 3 columnas) */}
                <div className="wrapper-grid-item payments-area">
                    <PagosSummary graficos={reportData?.graficos} />
                </div>

                {/* 3. TOTALES ACUMULADOS (Ocupa 3 columnas) */}
                <div className="wrapper-grid-item summary-area">
                    <ReportSummary
                        resumenMonetario={reportData?.resumenMonetario}
                        resumenSalidasInventario={reportData?.resumenSalidasInventario}
                    />
                </div>

            </div>

            {/* En ReportTimeline le inyectas la lista cruda de ventas por si quieres pintar la tabla analítica */}
            <ReportTimeline
                ventas={reportData?.ventas || []}
            />
        </div>
    );
}
export default ReportDay;