import "./SelectionCards.css";
function SelectionCards({
    label,
    options = [],
    value,
    onChange,
    multiple = false,
    disabled = false,
}) {
    const isSelected = (id) => {
        if (multiple) {
            return Array.isArray(value) && value.includes(id);
        }
        return String(value) === String(id);
    };
    const handleClick = (id) => {
        if (disabled) return;
        if (multiple) {
            const current = Array.isArray(value) ? [...value] : [];
            if (current.includes(id)) {
                onChange(current.filter(item => item !== id));
            } else {
                onChange([...current, id]);
            }
            return;
        }
        onChange(id);
    };
    return (
        <div className="selection-cards">
            {label && (
                <label className="selection-cards__label">
                    {label}
                </label>
            )}
            <div className="selection-cards__grid">
                {options.map((option) => {
                    const selected = isSelected(option.id);
                    return (
                        <button
                            key={option.id}
                            type="button"
                            disabled={disabled}
                            className={`selection-card ${selected ? "selection-card--selected" : ""}`}
                            onClick={() => handleClick(option.id)}
                        >
                            <div className="selection-card__indicator">
                                {multiple ? (
                                    <div className={`selection-card__checkbox ${selected ? "selection-card__checkbox--selected" : ""}`}>
                                        {selected && "✓"}
                                    </div>
                                ) : (
                                    <div className={`selection-card__radio ${selected ? "selection-card__radio--selected" : ""}`}>
                                        {selected && (
                                            <span className="selection-card__radio-dot" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="selection-card__content">
                                <div className="selection-card__title">
                                    {option.nombre}
                                </div>
                                {option.descripcion && (
                                    <div className="selection-card__description">
                                        {option.descripcion}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
export default SelectionCards;