// src/components/DraftLoad/DraftLoad.jsx
import { useEffect } from "react";
import Swal from "sweetalert2";
import { getDraft, removeDraft } from "../../stores/draftStorage";
export default function DraftLoad({
    mode = "new",
    storageKey,
    onLoad,
    onReady
}) {
    useEffect(() => {
        // Solo aplica para registros nuevos
        if (mode !== "new") return;
        const draft = getDraft(storageKey);
        if (!draft) {
            onReady?.();
            return;
        }
        const origen = draft?.origen?.toLowerCase?.() ?? "manual";
        switch (origen) {
            case "excel": {
                let timerInterval;
                Swal.fire({
                    title: "Importación desde Excel",
                    html: `
                        <div style="font-size:16px;">
                            Abriendo el ingreso generado desde Excel...
                            <br><br>
                            <strong style="font-size:32px;">
                                <b></b>
                            </strong>
                        </div>
                    `,
                    icon: "info",
                    timer: 3000,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        const b = Swal.getHtmlContainer().querySelector("b");
                        const updateCounter = () => {
                            const segundos = Math.ceil(Swal.getTimerLeft() / 1000);
                            b.textContent = segundos;
                        };
                        updateCounter();
                        timerInterval = setInterval(updateCounter, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    }
                }).then(() => {
                    onLoad?.(draft);
                    onReady?.();
                });
                break;
            }
            case "manual":
            default:
                Swal.fire({
                    title: "Borrador encontrado",
                    html:
                        "Se encontró un <b>INGRESO</b> sin terminar.<br><br>¿Deseas recuperarlo?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Recuperar",
                    cancelButtonText: "Eliminar borrador",
                    confirmButtonColor: "var(--color-primary)",
                    cancelButtonColor: "#d33",
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        onLoad?.(draft);
                        onReady?.();
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        removeDraft(storageKey);
                        onReady?.();
                        Swal.fire({
                            title: "Borrador eliminado",
                            icon: "success",
                            timer: 1200,
                            showConfirmButton: false
                        });
                    }
                });
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}