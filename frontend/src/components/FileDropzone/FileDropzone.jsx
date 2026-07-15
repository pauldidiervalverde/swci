import { useRef } from "react";
import {
    UploadCloud,
    FileSpreadsheet,
    X,
} from "lucide-react";
import "./FileDropzone.css";
function FileDropzone({
    file,
    onFileChange,
    accept = ".xlsx,.xls,.csv",
}) {
    const inputRef = useRef(null);
    const handleClick = () => {
        inputRef.current?.click();
    };
    const handleFileSelect = (event) => {
        const selectedFile =
            event.target.files?.[0];
        if (!selectedFile) return;
        onFileChange(selectedFile);
    };
    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile =
            event.dataTransfer.files?.[0];
        if (!droppedFile) return;
        onFileChange(droppedFile);
    };
    const handleDragOver = (event) => {
        event.preventDefault();
    };
    const removeFile = () => {
        onFileChange(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };
    return (
        <div className="file-dropzone">
            {!file ? (
                <div
                    className="file-dropzone__area"
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <UploadCloud size={40} />
                    <h3>
                        Arrastre el archivo aquí
                    </h3>
                    <p>
                        o haga clic para
                        seleccionar
                    </p>
                    <span>
                        Excel (.xlsx, .xls)
                    </span>
                </div>
            ) : (
                <div className="file-dropzone__file">
                    <div className="file-dropzone__info">
                        <FileSpreadsheet
                            size={32}
                        />
                        <div>
                            <div className="file-dropzone__name">
                                {file.name}
                            </div>
                            <div className="file-dropzone__size">
                                {(
                                    file.size /
                                    1024
                                ).toFixed(2)}
                                {" "}
                                KB
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="file-dropzone__remove"
                        onClick={removeFile}
                    >
                        <X size={18} />
                    </button>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                key={file ? file.name : "empty-input"}
                hidden
                onChange={
                    handleFileSelect
                }
            />
        </div>
    );
}
export default FileDropzone;