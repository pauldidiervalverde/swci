import { useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import SelectField from "../../components/SelectField/SelectField";
import Button from "../../components/Button/Button";
import { useAuthStore } from "../../stores/authStore";
import "./UsuarioModal.css";
function UsuarioModal({
    open,
    onClose,
    onSave,
    usuario = null,
    roles = [],
}) {
    const tiendaActiva = useAuthStore((state) => state.tiendaActiva);
    const [form, setForm] = useState({
        tiendas: [],
        nombre: "",
        usuario: "",
        correo: "",
        telefono: "",
        direccion: "",
        observacion: "",
        rolId: "",
        estado: true,
    });
    useEffect(() => {
        if (!usuario) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({
                tiendas: [tiendaActiva.id],
                nombre: "",
                usuario: "",
                correo: "",
                telefono: "",
                direccion: "",
                observacion: "",
                rolId: "",
                estado: true,
            });
            return;
        }
        setForm({
            tiendas: [tiendaActiva.id],
            nombre: usuario.nombre ?? "",
            usuario: usuario.usuario ?? "",
            correo: usuario.correo ?? "",
            telefono: usuario.telefono ?? "",
            direccion: usuario.direccion ?? "",
            observacion: usuario.observacion ?? "",
            rolId: usuario.rolId ?? "",
            estado: usuario.estado,
        });
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    if (!open) return null;
    return (
        <Modal
            title={usuario ? "Editar Usuario" : "Nuevo Usuario"}
            onClose={onClose}
        // size="medium"
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
                                label="Nombre Completo"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="tienda"
                                label="Tienda asignada"
                                value={tiendaActiva?.nombre ?? "-"}
                                disabled
                            />
                        </div>
                    </div>

                    <Input
                        name="usuario"
                        label="Usuario"
                        value={form.usuario}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="contraseña"
                        label="Contraseña"
                        type={usuario ? "password" : "text"}
                        value={usuario ? usuario.password : "Clave123/*"}
                        disabled
                    />
                    <div className="cliente-form__wide">
                        <div className="cliente-form__div">
                            <Input
                                name="correo"
                                type="email"
                                label="Correo"
                                value={form.correo}
                                onChange={handleChange}
                            />
                            <Input
                                name="telefono"
                                label="Teléfono"
                                value={form.telefono}
                                onChange={handleChange}
                            />
                        </div>
                    </div>




                    <SelectField
                        id="rolId"
                        name="rolId"
                        label="Rol"
                        value={form.rolId}
                        onChange={handleChange}
                        options={roles}
                        placeholder="Seleccione un rol"
                    />

                    <SelectField
                        id="estado"
                        name="estado"
                        label="Estado"
                        value={form.estado}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                estado: e.target.value === "true",
                            }))
                        }
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

                    <div className="modal-form__field modal-form__field--full">
                        <Input
                            name="direccion"
                            label="Dirección"
                            value={form.direccion}
                            onChange={handleChange}
                        />
                    </div>
                    {/* <div className="modal-form__field modal-form__field--full">
                        <label className="modal-form__label">
                            Observación
                        </label>
                        <textarea
                            className="modal-form__textarea"
                            name="observacion"
                            value={form.observacion}
                            onChange={handleChange}
                        />
                    </div> */}
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
export default UsuarioModal;