import "./DashboardCard.css";
// Removemos la importación de prop-types
function DashboardCard({
    title,
    value,
    icon: Icon,
    trend,
    suffix = "",
    status = "normal" // 'normal' | 'success' | 'warning' | 'danger' | 'info'
}) {
    const hasTrend = trend !== undefined && trend !== null;
    const isPositive = trend > 0;
    return (
        <div className={`db-card db-card--status-${status}`}>
            <div className="db-card__header">
                <span className="db-card__title">{title}</span>
                {Icon && (
                    <div className={`db-card__icon-wrapper db-card__icon-wrapper--${status}`}>
                        <Icon size={24} className="db-card__icon" />
                    </div>
                )}
            </div>
            <div className="db-card__body">
                <span className="db-card__value">
                    {value}
                    {suffix && <span className="db-card__suffix"> {suffix}</span>}
                </span>
                {hasTrend && (
                    <div className={`db-card__trend db-card__trend--${isPositive ? "up" : "down"}`}>
                        <span className="db-card__trend-badge">
                            {isPositive ? "↑" : "↓"} {Math.abs(trend)}%
                        </span>
                        <span className="db-card__trend-label">vs mes anterior</span>
                    </div>
                )}
            </div>
        </div>
    );
}
export default DashboardCard;