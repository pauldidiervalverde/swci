import "./Button.css";

function Button({
    children,
    type = "button",
    variant = "primary",
    onClick,
    disabled = false,
    icon,
    form,
}) {
    return (
        <button
            type={type}
            form={form}
            className={`button button--${variant}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon}
            {children}
        </button>
    );
}

export default Button;