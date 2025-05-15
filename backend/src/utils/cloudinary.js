// const { v2: cloudinary } = require("cloudinary");
// const dotenv = require("dotenv");

// dotenv.config({ path: "./.env" });

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// const uploadFileToCloudinary = (fileData) => {
//   return new Promise((resolve, reject) => {
//     if (!fileData || !fileData.buffer) {
//       return reject(new Error("File buffer is required"));
//     }

//     const uploadStream = cloudinary.uploader.upload_stream(
//       { resource_type: "auto", public_id: fileData.originalname.split('.').slice(0, -1).join('.') }, // Use original name as public ID (can be customized)
//       (error, result) => {
//         if (error) {
//           return reject(new Error(`Cloudinary upload error: ${error.message}`));
//         }
//         resolve(result);
//       }
//     );

//     uploadStream.end(fileData.buffer);
//   });
// };

// module.exports = uploadFileToCloudinary;

const dotenv = require("dotenv");
const { v2: cloudinary } = require("cloudinary");
const fs = require('fs');
dotenv.config({ path: "./.env" });
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadFileToCloudinary = async (localFilePath) => {
  console.log("Uploading file from path:", localFilePath);

  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file hash been uploaded  successfully

    console.log("File is uploaded on cloudinary");

    return response;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error); // 🔥 Add this line
    fs.unlinkSync(localFilePath);
    return null;
  }
};
module.exports = uploadFileToCloudinary;