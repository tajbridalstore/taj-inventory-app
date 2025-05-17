const express = require("express");
const cors = require("cors");
const productRoute = require("./routes/product.route");
const uploadRoutes = require("./routes/upload.route");
const orderRoutes = require("./routes/order.route");
const inventoryRoutes = require("./routes/inventory.route");
const path = require("path");
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // For form-style data
// app.use(cors({
//     origin: "https://inventorytaj.in", // Frontend URL
//     credentials: true
// }));
app.use(cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true
}));

// Serve static files from uploads
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');

console.log("Serving static files from:", uploadPath);
app.use('/uploads', express.static(uploadPath));


// Routes
app.use("/api/v1/product", productRoute);
app.use("/api/v1/image", uploadRoutes);
app.use("/api/v1/inventory",inventoryRoutes);
app.use("/api/v1/order", orderRoutes);
module.exports = app;
