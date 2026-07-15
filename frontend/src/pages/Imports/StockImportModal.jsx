import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import FileDropzone from "../../components/FileDropzone/FileDropzone";
import Button from "../../components/Button/Button";
// import DashboardCard from "../../components/DashboardCard/DashboardCard";
//import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { saveDraft } from "../../stores/draftStorage";
import { parseSheet, readExcelFile } from "./stockExcelParser";
import { buildProductIndex, mapExcelToStock } from "./stockImportService";
import SummaryCard from "../../components/SummaryCard/SummaryCard";
import "./StockImportModal.css";

function StockImportModal({
    categorias = [], // estos valores obtenerlos localmente
    productos = [], // estos valores obtenerlos localmente
    onClose,
}) {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [workbook, setWorkbook] = useState(null);
    const [cards, setCards] = useState([]);
    /*
    /*
=====================================================
1. CARGA DEL EXCEL
=====================================================
*/
    const handleFileChange = async (selectedFile) => {
        if (!selectedFile) {
            setFile(null);
            setWorkbook(null);
            setCards([]);
            return;
        }
        setFile(selectedFile);
        try {
            const wb = await readExcelFile(selectedFile);
            setWorkbook(wb);

            const productIndex = buildProductIndex(productos);
            const generatedCards = categorias.map((cat) => {
                const sheetName = wb.SheetNames.find(
                    (s) =>
                        s.trim().toUpperCase() ===
                        cat.nombre.trim().toUpperCase()
                );
                if (!sheetName) {
                    return {
                        categoriaId: cat.id,
                        nombre: cat.nombre,
                        sheetName: null,
                        total: 0,
                        encontrados: 0,
                        errores: 0,
                        status: "missing",
                    };
                }
                const rows = parseSheet(wb, sheetName);
                const detalles = mapExcelToStock(
                    rows,
                    productIndex,
                    cat.id
                );
                return {
                    categoriaId: cat.id,
                    nombre: cat.nombre,
                    sheetName,
                    total: detalles.length,
                    encontrados: detalles.filter(
                        (x) => x.estado === "OK"
                    ).length,
                    errores: detalles.filter(
                        (x) => x.estado === "ERROR"
                    ).length,
                    status: detalles.some(
                        (x) => x.estado === "ERROR"
                    )
                        ? "warning"
                        : "ok",
                };
            });
            setCards(generatedCards);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo leer el archivo Excel.",
            });
        }
    };
    /*
=====================================================
2. IMPORTAR UNA CATEGORÍA
=====================================================
*/
    const handleImportCategory = (card) => {
        if (!workbook || !card.sheetName) return;
        const productIndex = buildProductIndex(productos);
        const rows = parseSheet(
            workbook,
            card.sheetName
        );
        const detalles = mapExcelToStock(
            rows,
            productIndex,
            card.categoriaId
        );
        console.log("========== RESULTADO DEL MAPEO ==========");
        console.table(detalles);
        const observacion = `LOTE Categoría: ${card.nombre}`;
        const draft = {
            observacion,
            clienteId: "",
            tipoMovimientoId: 1,
            ventaId: "",
            categoria: card.categoriaId,
            origen: "EXCEL",
            createdAt: new Date(),
            detalles: detalles
                .filter((x) => x.estado === "OK")
                .map((x) => ({
                    productoId: x.productoId,
                    codigo: x.codigo,
                    marca: x.marca,
                    descripcion: x.descripcion,
                    color: x.color,
                    tallas: x.tallas,
                    cantidad: x.cantidad,
                    costoUnitario: x.costoUnitario,
                })),
        };
        console.log("========== CABECERA DRAFT ==========");
        console.log({
            observacion: draft.observacion,
            origen: draft.origen,
            categoria: draft.categoria,
            tipoMovimientoId: draft.tipoMovimientoId,
            createdAt: draft.createdAt,
            totalDetalles: draft.detalles.length,
        });

        console.log("========== DETALLES DRAFT ==========");
        console.table(draft.detalles);
        console.log("===================================");

        saveDraft("draft_ingreso", draft);
        onClose();
        navigate("/ingresos/nuevo");
    };
    /*
    =====================================================
    RENDER
    =====================================================
    */
    return (
        <Modal
            size="large"
            title="Importación de Stock por Categoría"
            onClose={onClose}
        >
            <div className="stock-import">
                <FileDropzone
                    file={file}
                    onFileChange={handleFileChange}
                    accept=".xlsx,.xls"
                />
                <div className="stock-import__cards">
                    {cards.map((card) => (
                        <SummaryCard
                            key={card.categoriaId}
                            title={card.nombre}
                            subtitle={
                                card.sheetName
                                    ? "Hoja encontrada"
                                    : "No existe esta hoja"
                            }
                            value={card.total}
                            suffix="productos"
                            status={card.status}
                            items={[
                                {
                                    label: "Encontrados",
                                    value: card.encontrados,
                                    status: "success"
                                },
                                {
                                    label: "No encontrados",
                                    value: card.errores,
                                    status: "danger"
                                }

                            ]}
                        >
                            <Button
                                disabled={!card.sheetName}
                                onClick={() => handleImportCategory(card)}
                            >
                                Importar Categoría
                            </Button>
                        </SummaryCard>
                    ))}
                </div>

                <div className="stock-import__actions">
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
export default StockImportModal;