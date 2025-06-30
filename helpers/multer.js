const path = require('path');
const multer = require('multer');

// Yükleme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public'); // public klasörüne kaydet
  },
  filename: (req, file, cb) => {
    // Dosya adı orijinal ismiyle (temizlenmiş)
    const fileName = path.basename(file.originalname, path.extname(file.originalname));
    const fileExt = path.extname(file.originalname);
    const cleanedFileName = fileName
      .replace(/[*+~.()'"!:@]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const finalFileName = `${cleanedFileName}${fileExt}`;
    cb(null, finalFileName);
  }
});

const fileFilter = (req, file, cb) => {
  console.log("📂 Yüklenen dosya türü:", file.mimetype);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = {
  upload
};
