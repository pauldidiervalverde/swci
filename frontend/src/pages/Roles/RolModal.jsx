import { useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import SelectField from "../../components/SelectField/SelectField";
import Button from "../../components/Button/Button";
import "../Usuarios/UsuarioModal.css";
function RolModal({
    open,
    onClose,
    onSave,
    rol = null,
}) {
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        estado: true,
    });
    useEffect(() => {
        if (!rol) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({
                nombre: "",
                descripcion: "",
                estado: true,
            });
            return;
        }
        setForm({
            nombre: rol.nombre ?? "",
            descripcion: rol.descripcion ?? "",
            estado: rol.estado ?? true,
        });
    }, [rol]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleEstado = (e) => {
        setForm((prev) => ({
            ...prev,
            estado: e.target.value === "true",
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };
    if (!open) return null;
    return (
        <Modal
            title={rol ? "Editar Rol" : "Nuevo Rol"}
            onClose={onClose}
        >
            <form
                onSubmit={handleSubmit}
                className="modal-form"
            >
                <div className="cliente-form__grid">
                    <div className="cliente-form__wide">
                        <div className="cliente-form__div">
                            <Input
                                name="nombre"
                                label="Nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                            />
                            {rol && (
                                <SelectField
                                    id="estado"
                                    name="estado"
                                    label="Estado"
                                    value={form.estado}
                                    onChange={handleEstado}
                                    options={[
                                        {
                                            id: "true",
                                            nombre: "Activo",
                                        },
                                        {
                                            id: "false",
                                            nombre: "Inactivo",
                                        },
                                    ]}
                                />
                            )}
                        </div>
                    </div>
                    <div className="modal-form__field modal-form__field--full">
                        <Input
                            name="descripcion"
                            label="Descripción"
                            value={form.descripcion}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="modal-form__actions">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                    >
                        Guardar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
export default RolModal;