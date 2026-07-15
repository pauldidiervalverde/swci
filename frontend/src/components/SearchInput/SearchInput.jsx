import { Search, X } from "lucide-react";

import "./SearchInput.css";

function SearchInput({
    value,
    onChange,
    id = "search",
    name = "search",
    placeholder = "Buscar...",
}) {
    const clearInput = () => {
        onChange("");
    };

    return (
        <div className="search-input">

            <Search
                size={18}
                className="search-input__icon"
            />

            <input
                id={id}
                name={name}
                type="text"
                maxLength={25}
                value={value}
                placeholder={placeholder}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        clearInput();
                    }
                }}
            />

            <button
                type="button"
                className={`search-input__clear ${value ? "visible" : ""
                    }`}
                onClick={clearInput}
                aria-label="Limpiar búsqueda"
            >
                <X size={16} />
            </button>

        </div>
    );
}

export default SearchInput;