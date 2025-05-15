// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();

const {uploadImage, singleImage} = require("../controllers/uploadImage.controller");
const upload = require("../middlewares/multer.middlewares");
router.post("/upload", upload.fields([
    { name: 'file', maxCount: 6 },
]), uploadImage); 
router.post("/single-upload", upload.single('productImage'), singleImage); 


module.exports = router;
