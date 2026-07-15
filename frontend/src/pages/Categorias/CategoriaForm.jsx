import { useMemo, useState } from "react";

import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";

// import "./CategoriaForm.css";

function CategoriaForm({
    categoria,
    categorias,
    onSubmit,
    onCancel,
}) {
    const [nombre, setNombre] =
        useState(
            categoria?.nombre || ""
        );

    const [
        descripcion,
        setDescripcion,
    ] = useState(
        categoria?.descripcion || ""
    );

    const [errors, setErrors] =
        useState({});

    const coincidencias =
        useMemo(() => {

            if (!nombre.trim()) {
                return [];
            }

            return categorias
                .filter((item) => {

                    if (
                        categoria &&
                        item.id ===
                        categoria.id
                    ) {
                        return false;
                    }

                    return item.nombre
                        .toLowerCase()
                        .includes(
                            nombre.toLowerCase()
                        );
                })
                .slice(0, 5);

        }, [
            nombre,
            categorias,
            categoria,
        ]);

    const validate = () => {

        const newErrors = {};

        const nombreLimpio =
            nombre.trim();

        if (!nombreLimpio) {

            newErrors.nombre =
                "Nombre requerido";

        } else if (
            nombreLimpio.length < 2
        ) {

            newErrors.nombre =
                "Mínimo 2 caracteres";

        } else if (
            nombreLimpio.length > 50
        ) {

            newErrors.nombre =
                "Máximo 50 caracteres";
        }

        const existe =
            categorias.find(
                (item) =>
                    item.nombre.toLowerCase() ===
                    nombreLimpio.toLowerCase() &&
                    item.id !==
                    categoria?.id
            );

        if (existe) {
            newErrors.nombre =
                "Ya existe una categoría con ese nombre";
        }

        if (
            descripcion &&
            descripcion.length > 200
        ) {
            newErrors.descripcion =
                "Máximo 200 caracteres";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors)
                .length === 0
        );
    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!validate()) {
            return;
        }

        onSubmit({
            nombre:
                nombre.trim(),
            descripcion:
                descripcion.trim(),
        });
    };

    return (
        <form
            className="modal-form"
            onSubmit={
                handleSubmit
            }
        >
            <div className="modal-form__field">
                <Input
                    id="categorianombre"
                    label="Nombre"
                    value={nombre}
                    onChange={(e) => {

                        const value =
                            e.target.value;

                        setNombre(
                            value
                        );

                        const existe =
                            categorias.find(
                                (
                                    item
                                ) =>
                                    item.nombre.toLowerCase() ===
                                    value
                                        .trim()
                                        .toLowerCase() &&
                                    item.id !==
                                    categoria?.id
                            );

                        setErrors(
                            (
                                prev
                            ) => ({
                                ...prev,
                                nombre:
                                    existe
                                        ? "Ya existe una categoría con ese nombre"
                                        : "",
                            })
                        );
                    }}
                    error={
                        errors.nombre
                    }
                    autoFocus
                />

                {coincidencias.length >
                    0 && (
                        <div className="modal-form__suggestions">
                            {coincidencias.map(
                                (
                                    item
                                ) => (
                                    <button
                                        type="button"
                                        key={
                                            item.id
                                        }
                                        className="modal-form__suggestion"
                                        onClick={() =>
                                            setNombre(
                                                item.nombre
                                            )
                                        }
                                    >
                                        {
                                            item.nombre
                                        }
                                    </button>
                                )
                            )}
                        </div>
                    )}
            </div>

            <div className="modal-form__field">

                <label
                    htmlFor="categoria-descripcion"
                    className="modal-form__label"
                >
                    Descripción
                </label>

                <textarea
                    id="categoria-descripcion"
                    className="modal-form__textarea"
                    value={
                        descripcion
                    }
                    onChange={(
                        e
                    ) =>
                        setDescripcion(
                            e.target
                                .value
                        )
                    }
                    rows="4"
                />

                {errors.descripcion && (
                    <span className="modal-form__error">
                        {
                            errors.descripcion
                        }
                    </span>
                )}

            </div>

            <div className="modal-form__actions">

                <Button
                    variant="secondary"
                    onClick={
                        onCancel
                    }
                >
                    Cancelar
                </Button>

                <Button
                    type="submit"
                >
                    Guardar
                </Button>

            </div>
        </form>
    );
}

export default CategoriaForm;