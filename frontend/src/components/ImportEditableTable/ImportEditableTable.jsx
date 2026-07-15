import Checkbox from "../Checkbox/Checkbox";
import Input from "../Input/Input";
import SelectField from "../SelectField/SelectField";
import "./ImportEditableTable.css";
function ImportEditableTable({
    rows = [],
    marcas = [],
    onChange,
    onSelectRow,
    onSelectAll,
}) {
    const allSelected =
        rows.length > 0 &&
        rows.every(
            (row) => row.selected
        );
    const getStatusClass = (
        status
    ) => {
        switch (status) {
            case "VERDE":
                return "import-table__status--ready";
            case "AMARILLO":
                return "import-table__status--duplicate";
            case "ROJO":
                return "import-table__status--error";
            case "IMPORTED":
                return "import-table__status--imported";
            default:
                return "";
        }
    };
    const getLabel = (
        status
    ) => {
        switch (status) {
            case "VERDE":
                return "LISTO";
            case "AMARILLO":
                return "EXISTE";
            case "ROJO":
                return "ERROR";
            case "IMPORTED":
                return "import-table__status--imported";
            default:
                return "";
        }
    };
    return (
        <div className="import-table">
            <table>
                <thead>
                    <tr>
                        <th><Checkbox checked={allSelected} onChange={onSelectAll} /></th>
                        <th>Estado</th>
                        <th>Código</th>
                        <th>Marca</th>
                        <th>Descripción</th>
                        <th>Color</th>
                        <th>Talla</th>
                        <th>Precio</th>
                        <th>Observación</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="import-table__empty">No existen registros</td>
                        </tr>
                    ) : (
                        rows.map((row, index) => (
                            <tr key={row.id || index}>
                                <td><Checkbox checked={row.selected} onChange={(e) => onSelectRow(index, e.target.checked)} /></td>
                                <td><span className={`import-table__status ${getStatusClass(row.status)}`}>{getLabel(row.status)}</span></td>
                                <td><span className={`import-table__status`}>{row.codigo}</span></td>
                                {/* <td>{row.codigo}</td> */}
                                <td><SelectField value={row.marcaId} options={marcas} placeholder="Marca" onChange={(e) => onChange(index, "marcaId", e.target.value)} /></td>
                                <td><Input value={row.descripcion} onChange={(e) => onChange(index, "descripcion", e.target.value)} /></td>
                                <td><Input value={row.color} onChange={(e) => onChange(index, "color", e.target.value)} /></td>
                                <td><Input value={row.tallas} onChange={(e) => onChange(index, "tallas", e.target.value)} /></td>
                                <td>Bs {row.precioVenta}</td>
                                <td>{row.observacion || "-"}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
export default ImportEditableTable;