// import XLSX from "xlsx";

// const REQUIRED_COLUMNS = ["Matric Number", "CA Score", "Exam Score"];

// const normalizeHeader = (value) =>
//   String(value || "")
//     .trim()
//     .toLowerCase();

// export const parseResultExcel = (buffer) => {
//   const workbook = XLSX.read(buffer, {
//     type: "buffer",
//   });

//   const sheetName = workbook.SheetNames[0];

//   if (!sheetName) {
//     throw new Error("Excel file does not contain a worksheet");
//   }

//   const worksheet = workbook.Sheets[sheetName];

//   const rows = XLSX.utils.sheet_to_json(worksheet, {
//     defval: "",
//   });

//   if (!rows.length) {
//     throw new Error("Excel file is empty");
//   }

//   const headers = Object.keys(rows[0]);

//   const normalizedHeaders = headers.map(normalizeHeader);

//   const missingColumns = REQUIRED_COLUMNS.filter(
//     (column) => !normalizedHeaders.includes(normalizeHeader(column)),
//   );

//   if (missingColumns.length) {
//     throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
//   }

//   return rows.map((row, index) => {
//     const normalizedRow = {};

//     Object.entries(row).forEach(([key, value]) => {
//       normalizedRow[normalizeHeader(key)] = value;
//     });

//     const matricValue = String(normalizedRow["matric number"] ?? "").trim();

//     const caValue = String(normalizedRow["ca score"] ?? "").trim();

//     const examValue = String(normalizedRow["exam score"] ?? "").trim();

//     return {
//       rowNumber: index + 2,
//       matricNumber: matricValue,
//       caScore: caValue === "" ? null : Number(caValue),
//       examScore: examValue === "" ? null : Number(examValue),
//     };
//   });
// };

import { parse } from "csv-parse/sync";

const REQUIRED_COLUMNS = ["Matric Number", "CA Score", "Exam Score"];

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const parseResultCSV = (buffer) => {
  // 1. Convert the raw file buffer into a readable string
  const csvString = buffer.toString("utf-8");

  let rows;
  try {
    // 2. Parse the CSV string into an array of objects
    rows = parse(csvString, {
      columns: true, // Automatically uses the first row as object keys
      skip_empty_lines: true,
      trim: true, // Removes accidental spaces around values
    });
  } catch (error) {
    throw new Error("Invalid CSV format. Please check your file.");
  }

  if (!rows || !rows.length) {
    throw new Error("CSV file is empty or missing headers");
  }

  // 3. Extract and normalize headers
  const headers = Object.keys(rows[0]);
  const normalizedHeaders = headers.map(normalizeHeader);

  // 4. Check for missing columns
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !normalizedHeaders.includes(normalizeHeader(column)),
  );

  if (missingColumns.length) {
    throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  // 5. Map and format the data exactly like before
  return rows.map((row, index) => {
    const normalizedRow = {};

    Object.entries(row).forEach(([key, value]) => {
      normalizedRow[normalizeHeader(key)] = value;
    });

    const matricValue = String(normalizedRow["matric number"] ?? "").trim();
    const caValue = String(normalizedRow["ca score"] ?? "").trim();
    const examValue = String(normalizedRow["exam score"] ?? "").trim();

    return {
      rowNumber: index + 2, // +2 because row 1 is headers, and array index is 0-based
      matricNumber: matricValue,
      caScore: caValue === "" ? null : Number(caValue),
      examScore: examValue === "" ? null : Number(examValue),
    };
  });
};
