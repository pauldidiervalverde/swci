import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, UserRoundPlus, Check } from "lucide-react";
import { filtrarClientes } from "./filtrarClientes";
import "./ClienteSearch.css";
import Modal from "../Modal/Modal";
import ClienteForm from "../../pages/Clientes/ClienteForm";

function ClienteSearch({
    clientes = [],
    value,
    onSearch,
    onRefresh,
    label,
    id,
    disabled = false,
    error
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [listaClientes, setListaClientes] = useState(clientes);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    // Sincronizar el estado local de clientes con la prop reactiva
    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setListaClientes(clientes);
    }, [clientes]);
    // Encontrar el cliente seleccionado actualmente basado en el valor id del padre
    const selectedCliente = listaClientes.find((c) => String(c.id) === String(value));
    // Sincronizar el texto del input cuando cambie la selección desde el padre
    useEffect(() => {
        if (selectedCliente) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearch(selectedCliente.nombre);
        } else {
            setSearch("");
        }
    }, [value, selectedCliente]);
    // Clientes filtrados dinámicamente en base a lo que escribe el usuario
    const clientesFiltrados = filtrarClientes(listaClientes, search);
    // Cerrar el dropdown si el usuario hace clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                // Si cerramos y había un cliente seleccionado, restauramos su texto
                if (selectedCliente) {
                    setSearch(selectedCliente.nombre);
                } else if (!value) {
                    setSearch("");
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedCliente, value]);
    // Asegurar que el elemento activo con el teclado sea visible haciendo scroll en el dropdown
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
    const handleSelectCliente = (cliente) => {
        if (disabled) return;
        setSearch(cliente.nombre);
        setIsOpen(false);
        setActiveIndex(-1);
        onSearch(cliente.id);
    };
    const handleCloseMenu = () => {
        setIsOpen(false);
        setIsModalOpen(true)
    }
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
                prev < clientesFiltrados.length - 1 ? prev + 1 : prev
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
                if (activeIndex >= 0 && activeIndex < clientesFiltrados.length) {
                    handleSelectCliente(clientesFiltrados[activeIndex]);
                } else if (clientesFiltrados.length === 1) {
                    handleSelectCliente(clientesFiltrados[0]);
                } else if (clientesFiltrados.length === 0) {
                    setIsModalOpen(true);
                }
            } else {
                setIsOpen(true);
            }
        }
        if (e.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
            if (selectedCliente) {
                setSearch(selectedCliente.nombre);
            } else {
                setSearch("");
            }
            inputRef.current?.blur();
        }
        if (e.key === "Tab") {
            setIsOpen(false);
            setActiveIndex(-1);
            if (selectedCliente) {
                setSearch(selectedCliente.nombre);
            }
        }
    };
    const handleClienteCreated = async (nuevoCliente) => {
        if (onRefresh) {
            const nuevosClientes = await onRefresh();
            if (nuevosClientes && Array.isArray(nuevosClientes)) {
                setListaClientes(nuevosClientes);
            }
        }
        setSearch(nuevoCliente.nombre);
        setIsModalOpen(false);
        setIsOpen(false);
        setActiveIndex(-1);
        onSearch(nuevoCliente.id);
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
                    <Search className="cliente-search__icon-left" size={18} />
                    <input
                        id={id}
                        ref={inputRef}
                        type="text"
                        disabled={disabled}
                        className={`cliente-search__input ${error ? "cliente-search__input--error" : ""}`}
                        placeholder="Buscar por nombre o telefono."
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
                        <ChevronDown className="cliente-search__arrow" size={16} />
                    </button>
                </div>
                {isOpen && !disabled && (
                    <ul className="cliente-search__dropdown" ref={dropdownRef}>
                        {clientesFiltrados.length > 0 ? (
                            clientesFiltrados.map((cliente, index) => {
                                const isSelected = String(cliente.id) === String(value);
                                const isActiveKeyboard = index === activeIndex;
                                return (
                                    <li
                                        key={cliente.id}
                                        className={`cliente-search__dropdown-item ${isSelected ? "active" : ""
                                            } ${isActiveKeyboard ? "keyboard-active" : ""}`}
                                        onClick={() => handleSelectCliente(cliente)}
                                    >
                                        <div className="cliente-search__item-content">
                                            <div className="cliente-search__item-info">
                                                <span className="cliente-search__item-nombre">
                                                    {cliente.nombre}
                                                </span>
                                                {cliente.telefono && (
                                                    <span className="cliente-search__item-telefono">
                                                        {cliente.telefono}
                                                    </span>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <Check className="cliente-search__item-check" size={16} />
                                            )}
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="cliente-search__no-results">
                                <span className="cliente-search__no-results-text">
                                    No se encontraron clientes.
                                </span>
                                <button
                                    type="button"
                                    className="cliente-search__btn-create"
                                    onClick={handleCloseMenu}
                                >
                                    <UserRoundPlus size={18} />
                                    <span>Registrar Cliente</span>
                                </button>
                            </li>
                        )}
                    </ul>
                )}
            </div>
            {error && <span className="cliente-search__error">{error}</span>}
            {isModalOpen && (
                <Modal
                    title="Registrar Nuevo Cliente"
                    size="small"
                    onClose={() => setIsModalOpen(false)}
                >
                    <ClienteForm
                        clienteData={null}
                        onSuccess={handleClienteCreated}
                    />
                </Modal>
            )}
        </div>
    );
}
export default ClienteSearch;