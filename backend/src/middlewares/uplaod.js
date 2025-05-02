const multer = require("multer");
const path = require("path");

// Returns a StorageEngine implementation configured to store files in memory as Buffer objects.
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // files only with extentions are allowed to upload
  const allowed = [".png", ".jpg", ".jpeg", ".webp"];
  // it extracts the extension of the files that are being uploaded
  const ext = path.extname(file.originalname).toLocaleLowerCase();

  cb(
    allowed.includes(ext) ? null : new Error("only images allowed!"),
    allowed.includes(ext)
  );
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // mb 5 mb
});
