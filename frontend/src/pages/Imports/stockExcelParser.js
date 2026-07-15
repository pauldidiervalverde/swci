import * as XLSX from "xlsx";

export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        resolve(workbook);
      };

      reader.onerror = reject;

      reader.readAsArrayBuffer(file);
    } catch (err) {
      reject(err);
    }
  });
}

export function parseSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}
