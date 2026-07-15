import { useState, useEffect } from "react";
import Input from "../../components/Input/Input"; // Ajusta la ruta según tu estructura
import { clientesService } from "../../services/clientesService";
import "./ClienteForm.css";
import { parseFecha } from "../../utils/normalizarHora";
function ClienteForm({ clienteData = null, onSuccess }) {
    const [formData, setFormData] = useState({
        nombre: "",
        fecha: "1900-01-01", // <-- 1. Nuevo campo en el estado inicial
        telefono: "",
        correo: "",
        direccion: "",
        nit: "",
        observacion: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    // Si viene data inicial (Editar), la precargamos en el estado
    useEffect(() => {
        if (clienteData) {
            const email = (clienteData.correo === null || clienteData.correo === undefined) ?
                "" : clienteData.correo;
            // Formatear la fecha de nacimiento para el input HTML (debe ser YYYY-MM-DD)
            let fechaFormateada = "";
            if (clienteData.fecha) {
                // Si viene en formato ISO string completo, extraemos los primeros 10 caracteres
                fechaFormateada = parseFecha(clienteData.fecha);
                console.log(fechaFormateada);

            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                nombre: clienteData.nombre || "",
                fecha: fechaFormateada ? fechaFormateada : "", // <-- 2. Cargamos el valor formateado
                telefono: clienteData.telefono || "",
                correo: email || "",
                direccion: clienteData.direccion || "",
                nit: clienteData.nit || "",
                observacion: clienteData.observacion || "",
            });
        }
    }, [clienteData]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Limpiar el error del campo que se está modificando
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };
    const validate = () => {
        const newErrors = {};
        if (formData.nombre.trim().length < 3) {
            newErrors.nombre = "El nombre es obligatorio. Min 3 caracteres";
        }
        if (!formData.telefono.trim()) {
            newErrors.telefono = "El teléfono es obligatorio";
        } else if (!/^[67]\d{7}$/.test(formData.telefono.trim())) {
            newErrors.telefono =
                "El teléfono debe tener 8 dígitos y comenzar con 6 o 7";
        }
        return newErrors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            setSubmitting(true);
            let response;
            if (clienteData?.id) {
                // Modo Edición
                response = await clientesService.update(clienteData.id, formData);
            } else {
                // Modo Creación
                response = await clientesService.create(formData);
            }
            if (response.success) {
                // Pasamos los datos del cliente guardado al callback del padre
                onSuccess(response.data);
            }
        } catch (error) {
            console.error("Error al procesar el cliente:", error);
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="cliente-form">
            <div className="cliente-form__grid">
                {/* 3. Quitamos la clase 'cliente-form__wide' para que ocupe una columna normal */}
                <div>
                    <Input
                        name="nombre"
                        label="Nombre Completo / Razón Social"
                        placeholder="Ej. Juan Pérez"
                        value={formData.nombre}
                        onChange={handleChange}
                        error={errors.nombre}
                    />
                </div>
                {/* 4. Agregamos el Input de Fecha al lado del nombre */}
                <div>
                    <Input
                        type="date" // Importante para desplegar el calendario del navegador
                        name="fecha"
                        label="Fecha de Nacimiento"
                        value={formData.fecha}
                        onChange={handleChange}
                    // error={errors.fecha}
                    />
                </div>
                <Input
                    name="nit"
                    label="NIT / CI"
                    placeholder="Ej. 10203040"
                    value={formData.nit}
                    onChange={handleChange}
                />
                <Input
                    name="telefono"
                    label="Teléfono / Celular"
                    placeholder="Ej. 70012345"
                    value={formData.telefono}
                    onChange={handleChange}
                    error={errors.telefono}
                />
                <div className="cliente-form__wide">
                    <Input
                        name="correo"
                        label="Correo Electrónico"
                        placeholder="Ej. juan.perez@example.com"
                        value={formData.correo}
                        onChange={handleChange}
                        error={errors.correo}
                    />
                </div>
                <div className="cliente-form__wide">
                    <Input
                        name="direccion"
                        label="Dirección"
                        placeholder="Ej. Av. Las Tres Pasos al Frente"
                        value={formData.direccion}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="cliente-form__actions">
                <button
                    type="submit"
                    disabled={submitting}
                    className="cliente-form__btn-submit"
                >
                    {submitting ? "Guardando..." : clienteData ? "Actualizar Cliente" : "Guardar Cliente"}
                </button>
            </div>
        </form>
    );
}
export default ClienteForm;