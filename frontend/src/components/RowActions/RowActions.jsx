import {
    Pencil,
    Eye,
    EyeOff,
    Search,
    Printer,
    KeyRound,
} from "lucide-react";
import "./RowActions.css";
function RowActions({
    row,
    onEdit,
    onToggleStatus,
    onView,
    onPrint,
    onPermissions,
    disabled = false,
}) {
    return (
        <div className="row-actions">
            {/* Ver */}
            {onView && (
                <button
                    className="row-actions__button"
                    onClick={() => !disabled && onView(row)}
                    title="Ver detalle"
                    disabled={disabled}
                >
                    <Search size={20} />
                </button>
            )}
            {/* Imprimir */}
            {onPrint && (
                <button
                    className="row-actions__button"
                    onClick={() => !disabled && onPrint(row)}
                    title="Imprimir"
                    disabled={disabled}
                >
                    <Printer size={20} />
                </button>
            )}
            {/* Permisos */}
            {onPermissions && (
                <button
                    className="row-actions__button"
                    onClick={() => !disabled && onPermissions(row)}
                    title="Permisos"
                    disabled={disabled}
                >
                    <KeyRound size={20} />
                </button>
            )}
            {/* Editar */}
            {onEdit && (
                <button
                    className="row-actions__button"
                    onClick={() => !disabled && onEdit(row)}
                    title="Editar"
                    disabled={disabled}
                >
                    <Pencil size={20} />
                </button>
            )}
            {/* Estado */}
            {onToggleStatus && (
                <button
                    className="row-actions__button"
                    onClick={() => !disabled && onToggleStatus(row)}
                    title={
                        row?.estado
                            ? "Desactivar"
                            : "Activar"
                    }
                    disabled={disabled}
                >
                    {row?.estado ? (
                        <EyeOff size={20} />
                    ) : (
                        <Eye size={20} />
                    )}
                </button>
            )}
        </div>
    );
}
export default RowActions;