import "./AuthLayout.css";

export default function AuthLayout({ children }) {
    return (
        <div className="auth-layout">

            <div className="auth-layout__left">
                <div className="auth-brand">



                    <h1>
                        Control de Inventario
                    </h1>

                    <p>
                        Gestión centralizada de inventarios,
                        productos, movimientos y reportes.
                    </p>

                </div>
            </div>

            <div className="auth-layout__right">
                {children}
            </div>

        </div>
    );
}