import "./StatusBadge.css";

function StatusBadge({
    status,
    activeText = "Activo",
    inactiveText = "Inactivo",
}) {

    return (
        <span
            className={`status-badge ${status
                    ? "status-badge--active"
                    : "status-badge--inactive"
                }`}
        >
            {status
                ? activeText
                : inactiveText}
        </span>
    );
}

export default StatusBadge;