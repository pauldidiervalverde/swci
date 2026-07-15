import { useMemo, useState, useEffect } from "react";
import "./MultiSelectInput.css";

function MultiSelectInput({
    label,
    value = "",
    onChange,
    options = [],
    order = {},
    separator = "-",
    placeholder = "",
    disabled = false,
    error = "",
}) {
    const [selected, setSelected] = useState([]);
    const [customValue, setCustomValue] = useState("");

    const hasSelection = selected.length > 0;

    useEffect(() => {
        if (!value) {
            setSelected([]);
            setCustomValue("");
            return;
        }

        const values = value.split(separator);

        const allExist = values.every((item) => options.includes(item));

        if (allExist) {
            setSelected(values);
            setCustomValue("");
        } else {
            setSelected([]);
            setCustomValue(value);
        }
    }, []);

    const orderedSelected = useMemo(() => {
        return [...selected].sort((a, b) => {
            const orderA = order[a] ?? 9999;
            const orderB = order[b] ?? 9999;

            return orderA - orderB;
        });
    }, [selected, order]);

    const selectedValue = useMemo(() => {
        return orderedSelected.join(separator);
    }, [orderedSelected, separator]);

    const handleOptionClick = (option) => {
        if (disabled) return;

        let newSelected = [];

        if (selected.includes(option)) {
            newSelected = selected.filter((item) => item !== option);
        } else {
            newSelected = [...selected, option];
        }

        newSelected.sort((a, b) => {
            const orderA = order[a] ?? 9999;
            const orderB = order[b] ?? 9999;

            return orderA - orderB;
        });

        setSelected(newSelected);

        const newValue = newSelected.join(separator);

        onChange?.(newValue);
    };

    const handleClear = () => {
        if (disabled) return;

        setSelected([]);
        setCustomValue("");

        onChange?.("");
    };

    const handleInputChange = (e) => {
        if (hasSelection) return;

        const newValue = e.target.value;

        setCustomValue(newValue);

        onChange?.(newValue);
    };

    return (
        <div className="multi-select">
            {label && (
                <label className="multi-select__label">
                    {label}
                </label>
            )}

            <div className="multi-select__wrapper">
                <input
                    type="text"
                    className={`multi-select__input ${error ? "multi-select__input--error" : ""
                        }`}
                    value={hasSelection ? selectedValue : customValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={hasSelection}
                    maxLength={50}
                />

                <div className="multi-select__actions">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={`multi-select__option ${selected.includes(option)
                                    ? "multi-select__option--selected"
                                    : ""
                                }`}
                            onClick={() => handleOptionClick(option)}
                            disabled={disabled}
                        >
                            {option}
                        </button>
                    ))}

                    <button
                        type="button"
                        className="multi-select__clear"
                        onClick={handleClear}
                        disabled={disabled}
                        aria-label="Limpiar"
                        title="Limpiar"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {error && (
                <span className="multi-select__error">
                    {error}
                </span>
            )}
        </div>
    );
}

export default MultiSelectInput;