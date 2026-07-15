import { useId } from "react";
import "./Checkbox.css";
function Checkbox({
    id,
    label,
    checked = false,
    onChange,
    disabled = false,
    error = "",
    name,
}) {
    const generatedId = useId();
    const checkboxId =
        id || generatedId;
    return (
        <div className="checkbox-group">
            <label
                htmlFor={checkboxId}
                className={`checkbox ${disabled
                    ? "checkbox--disabled"
                    : ""
                    }`}
            >
                <input
                    id={checkboxId}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={onChange}
                    className="checkbox__input"
                />
                <span className="checkbox__box">
                    {checked && (
                        <span className="checkbox__check">
                            ✓
                        </span>
                    )}
                </span>
                {label && (
                    <span className="checkbox__label">
                        {label}
                    </span>
                )}
            </label>
            {error && (
                <span className="checkbox__error">
                    {error}
                </span>
            )}
        </div>
    );
}
export default Checkbox;