import { ShieldAlert, Layers, Activity, TrendingUp } from "lucide-react";
import "./HomeCardsGrid.css";

function HomeCardsGrid({
    totalInversionStock = 0,
    productosAgotados = 0,
    porcentajeEficiencia = 100,
    mermasMesActual = 0
}) {
    return (
        <div className="home-cards-responsive-grid">

            {/* CARD 1: VALORACIÓN FINANCIERA DEL STOCK */}
            <div className="home-card-premium card-glow-primary">
                <div className="home-card-header">
                    <span className="home-card-tag bg-tag-primary">Patrimonio Activo</span>
                    <div className="home-card-icon-box icon-primary">
                        <Layers size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div className="home-card-body">
                    <h2 className="home-card-value">
                        Bs. {totalInversionStock.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="home-card-title">Valor Neto del Inventario</p>
                </div>
                <div className="home-card-footer">
                    <span className="footer-metric-positive">Capital Inmovilizado en Tienda</span>
                </div>
            </div>

            {/* CARD 2: ALERTAS CRÍTICAS DE STOCK BAJO */}
            <div className={`home-card-premium card-glow-danger ${productosAgotados > 0 ? "border-pulse-critical" : ""}`}>
                <div className="home-card-header">
                    <span className={`home-card-tag ${productosAgotados > 0 ? "bg-tag-danger" : "bg-tag-success"}`}>
                        {productosAgotados > 0 ? "Reposición Urgente" : "Stock Sano"}
                    </span>
                    <div className={`home-card-icon-box ${productosAgotados > 0 ? "icon-danger" : "icon-success"}`}>
                        <ShieldAlert size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div className="home-card-body">
                    <h2 className="home-card-value text-black-deep">
                        {productosAgotados} <span className="home-card-value-unit">Artículos</span>
                    </h2>
                    <p className="home-card-title">Línea de Stock Mínimo Superada</p>
                </div>
                <div className="home-card-footer">
                    <span className={productosAgotados > 0 ? "footer-metric-negative" : "footer-metric-positive"}>
                        {productosAgotados > 0 ? "Riesgo de quiebre de ventas" : "Niveles de reserva óptimos"}
                    </span>
                </div>
            </div>

            {/* CARD 3: EFICIENCIA DE MOVIMIENTOS (Rotación vs Salidas libres) */}
            <div className="home-card-premium card-glow-success">
                <div className="home-card-header">
                    <span className="home-card-tag bg-tag-success">Rendimiento Mensual</span>
                    <div className="home-card-icon-box icon-success">
                        <TrendingUp size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div className="home-card-body">
                    <h2 className="home-card-value">
                        {porcentajeEficiencia}%
                    </h2>
                    <p className="home-card-title">Eficiencia de Salida de Stock</p>
                </div>
                <div className="home-card-footer">
                    <span className="footer-metric-positive">Mercadería convertida en ingresos directos</span>
                </div>
            </div>

            {/* CARD 4: FUGAS AUDITABLES (Ajustes negativos / Mermas) */}
            <div className="home-card-premium card-glow-warning">
                <div className="home-card-header">
                    <span className="home-card-tag bg-tag-warning">Auditoría Física</span>
                    <div className="home-card-icon-box icon-warning">
                        <Activity size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div className="home-card-body">
                    <h2 className="home-card-value text-black-deep">
                        {mermasMesActual} <span className="home-card-value-unit">prendas</span>
                    </h2>
                    <p className="home-card-title">Mermas y Ajustes de Caja</p>
                </div>
                <div className="home-card-footer">
                    <span className="footer-metric-neutral">Salidas no comerciales registradas este mes</span>
                </div>
            </div>

        </div>
    );
}

export default HomeCardsGrid;