































































import { parse } from "csv-parse/sync";

const REQUIRED_COLUMNS = ["Matric Number", "CA Score", "Exam Score"];

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const parseResultCSV = (buffer) => {
  
  const csvString = buffer.toString("utf-8");

  let rows;
  try {
    
    rows = parse(csvString, {
      columns: true, 
      skip_empty_lines: true,
      trim: true, 
    });
  } catch (error) {
    throw new Error("Invalid CSV format. Please check your file.");
  }

  if (!rows || !rows.length) {
    throw new Error("CSV file is empty or missing headers");
  }

  
  const headers = Object.keys(rows[0]);
  const normalizedHeaders = headers.map(normalizeHeader);

  
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !normalizedHeaders.includes(normalizeHeader(column)),
  );

  if (missingColumns.length) {
    throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  
  return rows.map((row, index) => {
    const normalizedRow = {};

    Object.entries(row).forEach(([key, value]) => {
      normalizedRow[normalizeHeader(key)] = value;
    });

    const matricValue = String(normalizedRow["matric number"] ?? "").trim();
    const caValue = String(normalizedRow["ca score"] ?? "").trim();
    const examValue = String(normalizedRow["exam score"] ?? "").trim();

    return {
      rowNumber: index + 2, 
      matricNumber: matricValue,
      caScore: caValue === "" ? null : Number(caValue),
      examScore: examValue === "" ? null : Number(examValue),
    };
  });
};
