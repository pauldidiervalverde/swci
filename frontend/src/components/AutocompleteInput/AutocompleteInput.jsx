import { useMemo } from "react";
import "./AutocompleteInput.css";
function AutocompleteInput({
    value,
    onChange,
    options = [],
    placeholder,
}) {
    const matches = useMemo(() => {
        if (!value) return [];
        return options.filter((item) =>
            item
                .toLowerCase()
                .includes(
                    value.toLowerCase()
                )
        );
    }, [value, options]);
    return (
        <div className="autocomplete">
            <input
                className="autocomplete__input"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
            {
                value &&
                matches.length > 0 && (
                    <div className="autocomplete__list">
                        {matches.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className="autocomplete__item"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )
            }
        </div>
    );
}
export default AutocompleteInput;