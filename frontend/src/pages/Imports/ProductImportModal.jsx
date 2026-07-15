import { useState } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import ImportSummaryCards from "../../components/ImportSummaryCards/ImportSummaryCards";
import ImportEditableTable from "../../components/ImportEditableTable/ImportEditableTable";
import FileDropzone from "../../components/FileDropzone/FileDropzone"; // 1. IMPORTAMOS TU NUEVA DROPZONE
import { productImportService } from "../../services/productImportService";
import "./ProductImportModal.css";

function ProductImportModal({ categoriaId, categoriaNombre, marcas, onClose }) {
    const [file, setFile] = useState(null); // Estado para controlar el archivo en la Dropzone
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({ total: 0, ready: 0, incomplete: 0, duplicated: 0, errors: 0 });
    const [loading, setLoading] = useState(false);

    /**
 * Procesa el archivo Excel cuando se arrastra o se selecciona
 */
    const handleFileChange = async (selectedFile) => {
        // Si el usuario borró el archivo mediante la 'X' de la Dropzone
        if (!selectedFile) {
            setFile(null);
            setRows([]);
            setSummary({ total: 0, ready: 0, incomplete: 0, duplicated: 0, errors: 0 });
            return;
        }

        setFile(selectedFile);

        try {
            setLoading(true);
            const buffer = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });

            // 1. Filtro 1: Buscar dinámicamente la hoja que coincida con la categoría seleccionada
            const categorySheetName = workbook.SheetNames.find(
                (sheetName) => sheetName.trim().toUpperCase() === categoriaNombre.trim().toUpperCase()
            );

            // Si no se encuentra ninguna hoja con ese nombre, arrojamos error inmediatamente
            if (!categorySheetName) {
                Swal.fire({
                    icon: "error",
                    title: "Categoría no encontrada",
                    text: `No existe una hoja llamada "${categoriaNombre}" dentro del archivo Excel.`,
                    confirmButtonColor: "var(--color-primary-light)",
                });
                setFile(null); // Reseteamos la Dropzone si el formato está mal
                setRows([]);
                setLoading(false);
                return;
            }

            // Si la encuentra, extraemos los datos de esa hoja específica
            const sheet = workbook.Sheets[categorySheetName];
            const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            // 2, 3, 4 y 5. Filtros de Columnas, Campos Vacíos, Tipos y Duplicados Internos (Códigos y Productos)
            // Pasamos 'marcas' para que valide de forma inmediata antes de ir al backend
            const localParsed = productImportService.transformRows(rawData, marcas);

            // 6. LLAMADA AL BACKEND: Enviamos para simulación real y chequeo transaccional contra la BD
            const response = await productImportService.simulateImport(categoriaId, localParsed);

            if (response.success && response.data) {
                const { totales, detallesFilas } = response.data;

                // Usamos la función adaptadora pasándole las marcas para resolver los IDs dinámicos
                const formattedRows = productImportService.formatBackendRows(detallesFilas, marcas);

                setRows(formattedRows);
                setSummary({
                    total: totales.totalLeidos,
                    ready: totales.nuevos,
                    incomplete: 0,
                    duplicated: totales.existentesOmitidos,
                    errors: totales.conflictosCriticos
                });

                Swal.fire({
                    icon: "success",
                    title: "Análisis del Servidor Completado",
                    text: `Se procesaron ${totales.totalLeidos} registros. Nuevos detectados: ${totales.nuevos}`,
                    confirmButtonText: "Revisar Datos",
                });
            }
        } catch (error) {
            console.error(error);

            // CRÍTICO: Si ocurre un error de validación local o del servidor, rechazamos el archivo por completo
            setFile(null); // Limpiamos la Dropzone
            setRows([]);   // Vaciamos la tabla para forzar que vuelva a pedir el archivo

            const msg = error.message || "";

            if (msg.includes("[MARCA_INEXISTENTE]")) {
                // Caso especial pedido: Falta crear la marca en el sistema
                Swal.fire({
                    icon: "error",
                    title: "¡Marca No Encontrada!",
                    text: msg.replace("[MARCA_INEXISTENTE]", ""), // Quitamos el tag interno de control
                    confirmButtonColor: "var(--color-primary-light)",
                    confirmButtonText: "Entendido y Regresar"
                });
            } else {
                // Errores de formato (columnas faltantes, código <= 0, duplicados internos o error del backend)
                Swal.fire({
                    icon: "warning",
                    title: "Error de Validación",
                    text: error.response?.data?.message || msg || "Ocurrió un error al procesar el archivo.",
                    confirmButtonColor: "var(--color-primary-light)",
                    confirmButtonText: "Corregir Excel"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRow = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index] = { ...updatedRows[index], [field]: value };

        setRows(updatedRows);
        setSummary(productImportService.calculateSummaryFromRows(updatedRows));
    };

    const handleSelectRow = (index, checked) => {
        const updatedRows = [...rows];
        updatedRows[index].selected = checked;
        setRows(updatedRows);
    };

    const handleSelectAll = (checked) => {
        setRows((prev) => prev.map((row) => ({ ...row, selected: checked })));
    };

    const handleImport = async () => {
        const selectedRows = rows.filter((row) => row.selected);

        if (selectedRows.length === 0) {
            Swal.fire({ icon: "warning", title: "Sin registros", text: "Seleccione al menos una fila con estado válido para importar." });
            return;
        }

        const tieneErrores = selectedRows.some(row => row.estado === "ROJO" || row.status === "ROJO");
        if (tieneErrores) {
            Swal.fire({
                icon: "error",
                title: "Acción Bloqueada",
                text: "No puede marcar ni importar filas con conflictos críticos (Estado Rojo). Corrija el código o desmárquelas."
            });
            return;
        }

        try {
            setLoading(true);
            const response = await productImportService.executeImport(categoriaId, selectedRows);

            if (response.success) {
                await Swal.fire({
                    icon: "success",
                    title: "¡Importación Exitosa!",
                    text: `Se han guardado correctamente ${response.data.guardadosConExito} productos en el inventario.`,
                });
                onClose();
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error al Confirmar Carga",
                text: error.response?.data?.message || "Ocurrió un error transaccional en el servidor al guardar.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal size="large" title={`Importar Productos - ${categoriaNombre}`} onClose={onClose}>
            <div className="product-import-modal">

                {/* REEMPLAZAMOS EL VIEJO ENVOLTORIO POR EL NUEVO COMPONENTE DROPZONE */}
                <div className="product-import-modal__upload">
                    <FileDropzone
                        file={file}
                        onFileChange={handleFileChange}
                        accept=".xlsx,.xls"
                    />
                    {loading && <div className="loading-spinner-container"><span className="loading-text">Procesando información con el servidor...</span></div>}
                </div>

                <ImportSummaryCards
                    total={summary.total}
                    ready={summary.ready}
                    incomplete={summary.incomplete}
                    duplicated={summary.duplicated}
                    errors={summary.errors}
                />

                <ImportEditableTable
                    rows={rows}
                    marcas={marcas}
                    onChange={handleChangeRow}
                    onSelectRow={handleSelectRow}
                    onSelectAll={handleSelectAll}
                />

                <div className="product-import-modal__actions">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleImport} disabled={loading || rows.length === 0}>
                        {loading ? "Guardando..." : "Importar"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default ProductImportModal;