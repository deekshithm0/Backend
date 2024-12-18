
const multer = require('multer');
const path = require('path');
const fs = require('fs')

// Define storage for the images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/productImages'); // Uploads directory
        // cb(null, path.join(__dirname, '..', 'public', 'productImages'))
    },
    filename: (req, file, cb) => {
         // Unique filename
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))  //cb function to add the image to the productImage folder named as date_filename
    }
});

const upload = multer({ storage: storage })
module.exports = upload;


