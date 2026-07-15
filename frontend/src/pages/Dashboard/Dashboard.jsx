import { useState, useEffect } from "react";
import { LayoutDashboard, Store, CalendarDays, RefreshCw } from "lucide-react";
import HomeCardsGrid from "../../pages/HomeCardsGrid/HomeCardsGrid";
import ReportTimeline from "../../pages/ReportesDia/ReportTimeline";
import { kardexService } from "../../services/kardexService";
import "./Dashboard.css";

function Dashboard() {
    // 1. Estados base simplificados y seguros
    const [datosHome, setDatosHome] = useState({
        mermasMesActual: 0,
        porcentajeEficiencia: 100,
        movimientos: []
    });
    const [cargando, setCargando] = useState(true);

    // 2. Función operativa del Dashboard
    const obtenerDatosDashboard = async () => {
        try {
            setCargando(true);

            // Forzamos el rango de fechas nativas
            const ayer = new Date("2026-07-01");
            const ahora = new Date();

            const fechaInicio = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 0, 0, 0, 0).toISOString();
            const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59, 999).toISOString();

            const filtros = { fechaInicio, fechaFin };

            // Consumimos el servicio del Kardex
            const response = await kardexService.getGeneral(filtros);

            if (response.success && response.data) {
                // BLINDAJE EXTRA: Detectamos dónde viene realmente el array
                let listaMovimientos = [];

                if (Array.isArray(response.data)) {
                    listaMovimientos = response.data;
                }
                // else if (response.data.movimientos && Array.isArray(response.data.movimientos)) {
                //     listaMovimientos = response.data.movimientos;
                // }
                // } else if (response.data.registros && Array.isArray(response.data.registros)) {
                //     listaMovimientos = response.data.registros;
                // } else if (typeof response.data === 'object') {
                //     // Si es un objeto, buscamos cualquier propiedad interna que sí sea un array
                //     const posibleArray = Object.values(response.data).find(val => Array.isArray(val));
                //     if (posibleArray) listaMovimientos = posibleArray;
                // }

                let mermas = 0;
                let ventasContadas = 0;
                let salidasTotales = 0;
                let valorTotalStockEstimado = 0; // Para darle uso a la primera Card de patrimonio

                listaMovimientos.forEach(mov => {
                    // Calculamos el patrimonio dinámico multiplicando cantidad por costo/precio si viene en el objeto
                    if (mov.producto?.precioVenta) {
                        valorTotalStockEstimado += (mov.cantidad * mov.producto.precioVenta);
                    }

                    // Clasificación de movimientos según las reglas de negocio
                    if (mov.tipoMovimiento?.nombre === "VENTA") {
                        ventasContadas += mov.cantidad;
                        salidasTotales += mov.cantidad;
                    } else if (["AJUSTE", "REGALO", "PROMOCION", "INTERCAMBIO"].includes(mov.tipoMovimiento?.nombre)) {
                        mermas += mov.cantidad;
                        salidasTotales += mov.cantidad;
                    }
                });

                const eficiencia = salidasTotales > 0 ? Math.round((ventasContadas / salidasTotales) * 100) : 100;

                // Guardamos todo en un único estado de manera limpia
                setDatosHome({
                    totalInversionStock: valorTotalStockEstimado,
                    mermasMesActual: mermas,
                    porcentajeEficiencia: eficiencia,
                    movimientos: listaMovimientos
                });
            }
        } catch (error) {
            console.error("Error al sincronizar el panel de control:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        obtenerDatosDashboard();
    }, []);

    // 3. Pantalla de carga minimalista
    if (cargando) {
        return (
            <div className="home-loading-screen">
                <RefreshCw size={24} className="spinner-icon" />
                <p>Sincronizando bitácora de stock y caja...</p>
            </div>
            // <div className="page-loading">

            //     <p className="page-loading__text">
            //         Preparando sus datos...
            //     </p>

            //     <div className="page-loading__bar">
            //         <div className="page-loading__progress"></div>
            //     </div>

            // </div>
        );
    }

    return (
        <div className="home-page-container">
            {/* ENCABEZADO PRINCIPAL */}
            <header className="home-main-header">
                <div className="header-title-wrapper">
                    <div className="header-icon-square">
                        <LayoutDashboard size={20} />
                    </div>
                    <div>
                        <h1 className="home-main-title">Panel Operativo Diario</h1>
                        <p className="home-main-subtitle">Monitoreo de flujo, prendas en tienda y auditoría física</p>
                    </div>
                </div>
                <div className="header-meta-badges">
                    <div className="meta-badge">
                        <Store size={14} />
                        <span>Vista General</span>
                    </div>
                    <div className="meta-badge-date">
                        <CalendarDays size={14} />
                        <span>{new Date().toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                </div>
            </header>

            {/* SECCIÓN 1: CARDS PREMIUM ASIGNADAS CON LOS DATOS REALES PROCESADOS */}
            <section className="home-section-wrapper">
                <HomeCardsGrid
                    totalInversionStock={datosHome.totalInversionStock || 0}
                    productosAgotados={0} // Puedes cambiarlo si agregas un contador de stock bajo
                    porcentajeEficiencia={datosHome.porcentajeEficiencia}
                    mermasMesActual={datosHome.mermasMesActual}
                />
            </section>

            {/* SECCIÓN 2: TIMELINE CONECTADO AL KARDEX */}
            <section className="home-section-wrapper grid-split-view">
                <div className="view-main-block">
                    {/* Le pasamos los movimientos reales mapeados del Kardex */}
                    <ReportTimeline ventas={datosHome.movimientos} />
                </div>
            </section>
        </div>
    );
}

export default Dashboard;