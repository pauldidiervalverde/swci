import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { filtrarVentas } from "./filtrarVentas";
import { obtenerFechaBolivia } from "../../utils/normalizarHora";
import "../ClienteSearch/ClienteSearch.css";

function VentasSearch({
    ventas = [],
    value,
    onSearch,
    label,
    id,
    disabled = false,
    error
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const [listaVentas, setListaVentas] = useState(ventas);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setListaVentas(ventas);
    }, [ventas]);

    const selectedVenta = listaVentas.find(
        (v) => String(v.id) === String(value)
    );

    useEffect(() => {
        if (selectedVenta) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearch(selectedVenta.codigo);
        } else {
            setSearch("");
        }
    }, [value, selectedVenta]);

    const ventasFiltradas = filtrarVentas(listaVentas, search);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);

                if (selectedVenta) {
                    setSearch(selectedVenta.codigo);
                } else if (!value) {
                    setSearch("");
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedVenta, value]);

    useEffect(() => {
        if (activeIndex >= 0 && dropdownRef.current) {
            const activeEl = dropdownRef.current.children[activeIndex];

            if (activeEl) {
                activeEl.scrollIntoView({
                    block: "nearest"
                });
            }
        }
    }, [activeIndex]);

    const handleInputChange = (e) => {
        const texto = e.target.value;

        setSearch(texto);
        setIsOpen(true);
        setActiveIndex(-1);

        if (texto.trim() === "") {
            onSearch(null);
        }
    };

    const handleSelectVenta = (venta) => {
        if (disabled) return;

        setSearch(venta.codigo);
        setIsOpen(false);
        setActiveIndex(-1);

        onSearch(venta.id);
    };

    const handleInputClick = () => {
        if (disabled) return;

        setIsOpen(true);
    };

    const handleKeyDown = (e) => {
        if (disabled) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();

            if (!isOpen) {
                setIsOpen(true);
                return;
            }

            setActiveIndex((prev) =>
                prev < ventasFiltradas.length - 1 ? prev + 1 : prev
            );
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();

            if (!isOpen) return;

            setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }

        if (e.key === "Enter") {
            e.preventDefault();

            if (isOpen) {
                if (
                    activeIndex >= 0 &&
                    activeIndex < ventasFiltradas.length
                ) {
                    handleSelectVenta(ventasFiltradas[activeIndex]);
                } else if (ventasFiltradas.length === 1) {
                    handleSelectVenta(ventasFiltradas[0]);
                }
            } else {
                setIsOpen(true);
            }
        }

        if (e.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);

            if (selectedVenta) {
                setSearch(selectedVenta.codigo);
            } else {
                setSearch("");
            }

            inputRef.current?.blur();
        }

        if (e.key === "Tab") {
            setIsOpen(false);
            setActiveIndex(-1);

            if (selectedVenta) {
                setSearch(selectedVenta.codigo);
            }
        }
    };
    return (
        <div
            className={`cliente-search ${disabled ? "cliente-search--disabled" : ""}`}
            ref={containerRef}
        >
            {label && (
                <label htmlFor={id} className="cliente-search__label">
                    {label}
                </label>
            )}

            <div className={`cliente-search__custom-container ${isOpen ? "open" : ""}`}>
                <div className="cliente-search__input-wrapper">
                    <Search
                        className="cliente-search__icon-left"
                        size={18}
                    />

                    <input
                        id={id}
                        ref={inputRef}
                        type="text"
                        disabled={disabled}
                        className={`cliente-search__input ${error ? "cliente-search__input--error" : ""
                            }`}
                        placeholder="Buscar por código o fecha."
                        value={search}
                        onChange={handleInputChange}
                        onClick={handleInputClick}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                    />

                    <button
                        type="button"
                        disabled={disabled}
                        className="cliente-search__arrow-button"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <ChevronDown
                            className="cliente-search__arrow"
                            size={16}
                        />
                    </button>
                </div>

                {isOpen && !disabled && (
                    <ul
                        className="cliente-search__dropdown"
                        ref={dropdownRef}
                    >
                        {ventasFiltradas.length > 0 ? (
                            ventasFiltradas.map((venta, index) => {
                                const isSelected =
                                    String(venta.id) === String(value);

                                const isKeyboard =
                                    index === activeIndex;

                                return (
                                    <li
                                        key={venta.id}
                                        className={`cliente-search__dropdown-item ${isSelected ? "active" : ""
                                            } ${isKeyboard
                                                ? "keyboard-active"
                                                : ""
                                            }`}
                                        onClick={() =>
                                            handleSelectVenta(venta)
                                        }
                                    >
                                        <div className="cliente-search__item-content">
                                            <span className="cliente-search__item-nombre">
                                                {obtenerFechaBolivia(
                                                    venta.fecha
                                                )}{" "}
                                                - {venta.codigo}
                                            </span>

                                            {isSelected && (
                                                <Check
                                                    className="cliente-search__item-check"
                                                    size={16}
                                                />
                                            )}
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="cliente-search__no-results">
                                <span className="cliente-search__no-results-text">
                                    No se encontró la venta.
                                </span>
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {error && (
                <span className="cliente-search__error">
                    {error}
                </span>
            )}
        </div>
    );
}

export default VentasSearch;