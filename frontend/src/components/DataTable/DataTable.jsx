import { Fragment, useEffect, useState, useMemo } from "react";
import {
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import "./DataTable.css";

function DataTable({
    columns,
    data = [],
    emptyMessage,
    paginationConfig,
    listItem = false
}) {
    const [expandedRows, setExpandedRows] = useState({});
    const [screen, setScreen] = useState("desktop");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [localPage, setLocalPage] = useState(1);
    const SERVER_BLOCK_SIZE = 100;

    // 🌟 Sincronización limpia durante el renderizado (Sin useEffect - Evita bucles infinitos)
    const [prevDataLength, setPrevDataLength] = useState(data.length);
    if (data.length !== prevDataLength) {
        setPrevDataLength(data.length);
        setLocalPage(1);
    }

    // Listener de responsividad
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 400) {
                setScreen("mobile");
            } else if (window.innerWidth <= 1200) {
                setScreen("tablet");
            } else {
                setScreen("desktop");
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleRow = (rowId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }));
    };

    // Si es lista continua, muestra todo. Si no, aplica paginación local.
    const displayedData = useMemo(() => {
        if (listItem) return data;

        const start = (localPage - 1) * rowsPerPage;
        return data.slice(start, start + rowsPerPage);
    }, [data, localPage, rowsPerPage, listItem]);

    // Métricas de paginación adaptadas
    const paginationMetrics = useMemo(() => {
        if (listItem) return null;

        if (!paginationConfig) {
            const totalRecords = data.length;
            const totalVirtualPages = Math.ceil(totalRecords / rowsPerPage);
            const globalStartIndex = (localPage - 1) * rowsPerPage;

            return {
                totalRecords,
                serverPage: 1,
                globalStartIndex,
                totalVirtualPages,
                currentGlobalPage: localPage
            };
        }

        const { totalRecords, serverPage } = paginationConfig;
        const globalStartIndex = ((serverPage - 1) * SERVER_BLOCK_SIZE) + ((localPage - 1) * rowsPerPage);
        const totalVirtualPages = Math.ceil(totalRecords / rowsPerPage);
        const currentGlobalPage = Math.ceil((globalStartIndex + 1) / rowsPerPage);

        return {
            totalRecords,
            serverPage,
            globalStartIndex,
            totalVirtualPages,
            currentGlobalPage
        };
    }, [paginationConfig, localPage, rowsPerPage, data.length, listItem]);

    // Manejador de páginas adaptado a modo local puro o mixto
    const handlePageChange = (direction) => {
        if (listItem) return;

        if (!paginationConfig) {
            if (direction === "next") {
                if (localPage < paginationMetrics.totalVirtualPages) setLocalPage(localPage + 1);
            } else if (direction === "prev") {
                if (localPage > 1) setLocalPage(localPage - 1);
            }
            return;
        }

        const { serverPage, onServerPageChange } = paginationConfig;

        if (direction === "next") {
            const nextLocalStart = localPage * rowsPerPage;
            if (nextLocalStart < data.length) {
                setLocalPage(localPage + 1);
            } else {
                setLocalPage(1);
                onServerPageChange(serverPage + 1);
            }
        } else if (direction === "prev") {
            if (localPage > 1) {
                setLocalPage(localPage - 1);
            } else if (serverPage > 1) {
                const maxLocalPagesInPreviousBlock = SERVER_BLOCK_SIZE / rowsPerPage;
                setLocalPage(maxLocalPagesInPreviousBlock);
                onServerPageChange(serverPage - 1);
            }
        }
    };

    const visibleColumns = columns.filter((column) => {
        if (screen === "desktop") return column.showDesktop !== false;
        if (screen === "tablet") return column.showTablet === true;
        return column.showMobile === true;
    });

    const hiddenColumns = columns.filter((column) => {
        if (screen === "desktop") return false;
        if (screen === "tablet") return column.showTablet !== true;
        return column.showMobile !== true;
    });

    return (
        <div className="datatable">
            <table>
                <thead>
                    <tr>
                        {visibleColumns.map((column) => {
                            // 🌟 Modificado: Sincronización de clases de alineación para th
                            const thClasses = [
                                "datatable__header-cell",
                                column.alignClass || ""
                            ].filter(Boolean).join(" ");

                            return (
                                <th
                                    key={column.key}
                                    className={thClasses || undefined}
                                >
                                    {column.label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {displayedData.length === 0 ? (
                        <tr>
                            <td colSpan={visibleColumns.length} className="datatable__empty">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        displayedData.map((row) => {
                            // 🌟 Lógica de Alerta: Evaluamos si precioVenta, stockActual o stockMinimo son 0
                            const tieneAlerta =
                                Number(row.precioVenta) === 0 ||
                                Number(row.stockActual) === 0;

                            const rowClasses = [
                                "datatable__row",
                                tieneAlerta ? "datatable__row--danger" : ""
                            ].filter(Boolean).join(" ");

                            return (
                                <Fragment key={row.id}>
                                    <tr className={rowClasses}>
                                        {visibleColumns.map((column) => {
                                            const cellClasses = [
                                                column.isPrimary ? "datatable__primary-cell" : "",
                                                column.alignClass ? column.alignClass : ""
                                            ].filter(Boolean).join(" ");

                                            return (
                                                <td
                                                    key={column.key}
                                                    className={cellClasses || undefined}
                                                >
                                                    {column.isPrimary && screen !== "desktop" && (
                                                        <button
                                                            type="button"
                                                            className="datatable__expand-btn"
                                                            onClick={() => toggleRow(row.id)}
                                                        >
                                                            {expandedRows[row.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                        </button>
                                                    )}

                                                    {column.render ? column.render(row) : row[column.key]}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {screen !== "desktop" &&
                                        expandedRows[row.id] &&
                                        hiddenColumns.length > 0 && (
                                            <tr className={`datatable__expanded-row ${tieneAlerta ? "datatable__row--danger" : ""}`.trim()}>
                                                <td colSpan={visibleColumns.length}>
                                                    <div className="datatable__details">
                                                        {hiddenColumns.map((column) => (
                                                            <div key={column.key} className="datatable__detail-item">
                                                                <span className="datatable__detail-label">
                                                                    {column.label}
                                                                </span>
                                                                <div
                                                                    className={`datatable__detail-value ${column.alignClass ? column.alignClass : ""}`.trim()}
                                                                >
                                                                    {column.render ? column.render(row) : row[column.key]}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                </Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Solo muestra paginación si listItem es false y hay registros */}
            {!listItem && paginationMetrics && paginationMetrics.totalRecords > 0 && (
                <div className="datatable__pagination">
                    <div className="datatable__pagination-limit">
                        <label htmlFor="rowsPerPage">Filas por página:</label>
                        <select
                            id="rowsPerPage"
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setLocalPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div className="datatable__pagination-info">
                        {paginationMetrics.globalStartIndex + 1}-
                        {Math.min(paginationMetrics.globalStartIndex + displayedData.length, paginationMetrics.totalRecords)} de {paginationMetrics.totalRecords}
                    </div>

                    <div className="datatable__pagination-buttons">
                        <button
                            type="button"
                            onClick={() => handlePageChange("prev")}
                            disabled={paginationConfig ? (paginationMetrics.serverPage === 1 && localPage === 1) : localPage === 1}
                            className="datatable__page-btn"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="datatable__page-current">
                            Pág. {paginationMetrics.currentGlobalPage} de {paginationMetrics.totalVirtualPages || 1}
                        </span>

                        <button
                            type="button"
                            onClick={() => handlePageChange("next")}
                            disabled={paginationMetrics.currentGlobalPage === paginationMetrics.totalVirtualPages}
                            className="datatable__page-btn"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;