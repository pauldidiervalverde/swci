import { useState, useEffect, useRef } from "react";
import "./SelectField.css";
function SelectField({
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
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    // Encontrar la opción seleccionada basada en la estructura { id, nombre }
    const selectedOption = options.find((opt) => String(opt.id) === String(value));
    // Cerrar el dropdown si el usuario hace clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // Simular el evento onChange nativo de HTML al seleccionar una opción
    const handleSelectOption = (optionId) => {
        if (disabled) return;
        if (onChange) {
            onChange({
                target: {
                    id,
                    name,
                    value: optionId
                }
            });
        }
        setIsOpen(false);
    };
    return (
        <div
            className={`select-field ${disabled ? "select-field--disabled" : ""}`}
            ref={containerRef}
        >
            {label && (
                <label htmlFor={id} className="select-field__label">
                    {label}
                </label>
            )}
            <div className={`select-field__custom-container ${isOpen ? "open" : ""}`}>
                {/* Botón interactivo que reemplaza visualmente al select nativo */}
                <button
                    id={id}
                    type="button"
                    disabled={disabled}
                    className={`select-field__input ${error ? "select-field__input--error" : ""
                        }`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className={!selectedOption ? "select-field__placeholder-text" : ""}>
                        {selectedOption ? selectedOption.nombre : placeholder}
                    </span>
                    <span className="select-field__arrow"></span>
                </button>
                {/* Desplegable estilizado */}
                {isOpen && !disabled && (
                    <ul className="select-field__dropdown">
                        {/* Opción por defecto (Placeholder) */}
                        <li
                            className={`select-field__dropdown-item ${value === "" ? "active" : ""}`}
                            onClick={() => handleSelectOption("")}
                        >
                            {placeholder}
                        </li>
                        {/* Mapeo exacto de tus opciones usando option.id y option.nombre */}
                        {options.map((option) => (
                            <li
                                key={option.id}
                                className={`select-field__dropdown-item ${String(option.id) === String(value) ? "active" : ""
                                    }`}
                                onClick={() => handleSelectOption(option.id)}
                            >
                                {option.nombre}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {error && <span className="select-field__error">{error}</span>}
        </div>
    );
}
export default SelectField;