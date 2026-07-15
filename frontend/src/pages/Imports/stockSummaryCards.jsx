function StockSummaryCards({ cards = [] }) {
    return (
        <div className="stock-summary">
            {cards.map(card => (
                <div key={card.nombre} className="stock-summary__card">
                    <h3>{card.nombre}</h3>
                    <p>{card.total} productos</p>
                </div>
            ))}
        </div>
    );
}

export default StockSummaryCards;