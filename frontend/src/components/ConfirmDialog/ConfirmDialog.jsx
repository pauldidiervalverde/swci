import Button from "../Button/Button";
import Modal from "../Modal/Modal";

import "./ConfirmDialog.css";

function ConfirmDialog({
    title,
    message,
    onConfirm,
    onClose,
}) {
    return (
        <Modal
            title={title}
            onClose={onClose}
        >
            <div className="confirm-dialog">
                <p className="confirm-dialog__message">
                    {message}
                </p>
                <div className="confirm-dialog__actions">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                    >
                        Confirmar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;