import "./Modal.css";

function Modal({
    title,
    children,
    onClose,
    size = "small", // Propiedad añadida para controlar el tamaño
}) {
    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                /* Combinamos la clase base 'modal' con la clase dinámica de tamaño */
                className={`modal modal--${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    <h2>{title}</h2>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="modal__body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;