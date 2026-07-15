// src/components/DocumentHistoryLayout/DocumentHistoryLayout.jsx
import React, { useState } from "react";
import DataTable from "../DataTable/DataTable";
import SearchInput from "../SearchInput/SearchInput";
import { HISTORIAL_COLUMNS } from "./tableConfigurations";
import { RefreshCw } from "lucide-react";
import "./DocumentHistoryLayout.css";

function DocumentHistoryLayout({
    type = "INGRESOS", // INGRESOS, VENTAS, MOVIMIENTOS
    //title = "Historial del Sistema",
    data = [],
    loading = false,
    emptyMessage = "No se encontraron registros correspondientes.",
    searchPlaceholder = "Buscar por código o descripción...",

    // Configuración de la API del servidor (Paginación Híbrida)
    serverPage = 1,
    totalRecords = 0,
    onServerPageChange,
    onSearchChange,
    onRowClick // Por si quieres abrir el modal cabecera-detalle al dar click
}) {
    const [searchValue, setSearchValue] = useState("");

    // Obtenemos dinámicamente las columnas basándonos en la prop de tipo
    const activeColumns = HISTORIAL_COLUMNS[type] || HISTORIAL_COLUMNS.INGRESOS;

    const handleSearch = (value) => {
        setSearchValue(value);
        if (onSearchChange) onSearchChange(value);
    };

    // Añadimos una acción dinámica si el usuario quiere interactuar con la fila entera
    const processedColumns = React.useMemo(() => {
        if (!onRowClick) return activeColumns;

        // Clonamos y modificamos la celda primaria o agregamos un renderizador personalizado si lo deseas
        return activeColumns;
    }, [activeColumns, onRowClick]);

    return (
        <div className="history-layout">
            {/* Cabecera Interna de Operaciones */}
            <div className="history-layout__toolbar">
                <div className="history-layout__search-box">
                    <SearchInput
                        value={searchValue}
                        onChange={handleSearch}
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className="history-layout__actions">
                    <button className="history-layout__btn-icon" title="Refrescar datos">
                        <RefreshCw size={18} className={loading ? "spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Contenedor de la Tabla */}
            <div className={`history-layout__table-container ${loading ? "history-layout__table-container--loading" : ""}`}>
                <DataTable
                    columns={processedColumns}
                    data={data.map(item => ({
                        ...item,
                        // Forzamos a que si hay un click en la fila, se dispare mediante el render nativo o una trampa limpia
                    }))}
                    emptyMessage={loading ? "Cargando registros..." : emptyMessage}
                    paginationConfig={{
                        totalRecords,
                        serverPage,
                        onServerPageChange
                    }}
                />
            </div>
        </div>
    );
}

export default DocumentHistoryLayout;