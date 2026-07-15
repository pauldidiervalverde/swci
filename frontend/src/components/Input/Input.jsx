import { useId } from "react";
import "./Input.css";
function Input({
    id,
    label,
    error,
    ...props
}) {
    const generatedId = useId();
    const inputId =
        id || generatedId;
    return (
        <div className="input-group">
            {label && (
                <label
                    htmlFor={inputId}
                    className="input-group__label"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`input ${error
                    ? "input--error"
                    : ""
                    }`}
                {...props}
            />
            {error && (
                <span className="input-group__error">
                    {error}
                </span>
            )}
        </div>
    );
}
export default Input;