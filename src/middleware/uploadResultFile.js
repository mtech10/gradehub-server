import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Common MIME types for CSV files
  const allowedMimeTypes = [
    "text/csv",
    "application/csv",
    "text/x-csv",
    "application/x-csv",
    "text/comma-separated-values",
    "text/x-comma-separated-values",
    "application/vnd.ms-excel", // Sometimes Windows forces CSVs to use this MIME type
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .csv files are allowed"), false);
  }
};

const uploadResultFile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

export default uploadResultFile;
