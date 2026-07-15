import "./SummaryCard.css";

function SummaryCard({
    title,
    subtitle, // Añadimos la prop aquí
    value,
    suffix = "",
    icon: Icon,
    status = "info",
    items = [],
    children
}) {
    return (
        <div className={`summary-card summary-card--${status}`}>
            <div className="summary-card__header">
                <div className="summary-card__title-container">
                    <div className="summary-card__title">
                        {title}
                    </div>
                    {/* Renderizado limpio del subtítulo dinámico */}
                    {subtitle && (
                        <div className="summary-card__subtitle">
                            {subtitle}
                        </div>
                    )}
                    <div className="summary-card__value">
                        {value}
                        {suffix && (
                            <span className="summary-card__suffix">
                                {" "}
                                {suffix}
                            </span>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className={`summary-card__icon summary-card__icon--${status}`}>
                        <Icon size={20} /> {/* Reducido ligeramente para balancear la UI */}
                    </div>
                )}
            </div>

            {items.length > 0 && (
                <div className="summary-card__items">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="summary-card__item"
                        >
                            <span>
                                {item.label}
                            </span>
                            <span
                                className={`summary-card__badge summary-card__badge--${item.status}`}
                            >
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {children && (
                <div className="summary-card__footer">
                    {children}
                </div>
            )}
        </div>
    );
}

export default SummaryCard;