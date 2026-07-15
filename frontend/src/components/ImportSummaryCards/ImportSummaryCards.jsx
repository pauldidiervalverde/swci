import "./ImportSummaryCards.css";
function ImportSummaryCards({
    total = 0,
    ready = 0,
    duplicated = 0,
    errors = 0,
}) {
    const cards = [
        {
            label: "Total",
            value: total,
            modifier: "total",
        },
        {
            label: "Listos",
            value: ready,
            modifier: "success",
        },
        {
            label: "Duplicados",
            value: duplicated,
            modifier: "warning",
        },
        {
            label: "Errores",
            value: errors,
            modifier: "danger",
        },
    ];
    return (
        <div className="import-summary-cards">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`import-summary-cards__card import-summary-cards__card--${card.modifier}`}
                >
                    <div className="import-summary-cards__value">
                        {card.value}
                    </div>
                    <div className="import-summary-cards__label">
                        {card.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
export default ImportSummaryCards;