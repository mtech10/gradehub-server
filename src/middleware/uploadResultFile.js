import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".xlsx", ".xls"];

  const extension = file.originalname
    .substring(file.originalname.lastIndexOf("."))
    .toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("Only .xlsx and .xls files are allowed"));
  }

  cb(null, true);
};

const uploadResultFile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

export default uploadResultFile;
