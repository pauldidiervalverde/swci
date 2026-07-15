import "./AppLoader.css";
export default function AppLoader() {
    return (
        <div className="app-loader">
            <div className="app-loader__content">
                <h1 className="app-loader__title">
                    SWCI
                </h1>
                <p className="app-loader__subtitle">
                    Sistema Web para Control de Inventario
                </p>
                <p className="app-loader__message">
                    Preparando su espacio de trabajo...
                </p>
                <div className="app-loader__progress">
                    <span></span>
                </div>
            </div>
        </div>
    );
}