import "./Select.css";

function Select({
    id,
    name,
    label,
    value,
    onChange,
    options = [],
    placeholder = "Seleccione...",
    error,
    disabled = false,
}) {
    return (
        <div className="select-field">

            {label && (
                <label
                    htmlFor={id}
                    className="select-field__label"
                >
                    {label}
                </label>
            )}

            <select
                id={id}
                name={name}
                className={`select-field__input ${error
                        ? "select-field__input--error"
                        : ""
                    }`}
                value={value}
                onChange={onChange}
                disabled={disabled}
            >
                <option value="">
                    {placeholder}
                </option>

                {options.map((option) => (
                    <option
                        key={option.id}
                        value={option.id}
                    >
                        {option.nombre}
                    </option>
                ))}
            </select>

            {error && (
                <span className="select-field__error">
                    {error}
                </span>
            )}

        </div>
    );
}

export default Select;