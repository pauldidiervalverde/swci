// import { BarChart3 } from "lucide-react";

import "./ReportHeader.css";
function ReportHeader() {
    return (
        <div className="report-header">
            <div className="report-header__info">
                {/* <div className="report-header__icon">
                    <BarChart3 size={26} />
                </div> */}
                <div>
                    <h1 className="report-header__title">
                        Reportes Comerciales
                    </h1>
                    <p className="report-header__subtitle">
                        Indicadores de ventas, ingresos y comportamiento del negocio.
                    </p>
                </div>
            </div>

        </div>
    );
}
export default ReportHeader;