import * as XLSX from "xlsx";
const REQUIRED_COLUMNS = [
  "CODIGO",
  "MARCA",
  "DESCRIPCION",
  "PRECIO",
  "COLOR",
  "TALLA",
];
const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, {
          type: "array",
        });
        resolve(workbook);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
const getSheetNames = (workbook) => {
  return workbook.SheetNames;
};
const getSheetRows = (workbook, sheetName) => {
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
  });
};
const validateColumns = (rows) => {
  if (!rows.length) {
    return {
      valid: false,
      missing: REQUIRED_COLUMNS,
    };
  }
  const headers = Object.keys(rows[0]);
  const missing = REQUIRED_COLUMNS.filter(
    (column) => !headers.includes(column),
  );
  return {
    valid: missing.length === 0,
    missing,
  };
};
export const importExcelService = {
  readFile,
  getSheetNames,
  getSheetRows,
  validateColumns,
};
