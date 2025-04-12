const express = require("express");
const mongoose = require("mongoose");
const Products = require("./schema");

const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Get MongoDB URI from environment variables
const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Error: MONGODB_URI is not defined in the .env file");
  process.exit(1); // Exit the application if URI is not set
}

// Connect to MongoDB
mongoose
  .connect(dbURI)
  .then(() => {
    console.log("MongoDB Connected Successfully to:", dbURI);
    // Start the server only after successful DB connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/tanks", require("./routes/tank"));

// Dean API endpoint
app.get("/api/products/:productId", async (req, res) => {
      try {
            const product = await Products.findById(req.params.productId);
            if (!product) {
                  return res.status(404).json({ message: "Product not found" });
            }
            res.json(product);
      } catch (err) {
            res.status(500).json({ message: err.message });
      }
});

//
app.get("/api/products", async (req, res) => {
      const category = req.query.category;

      // All categories
      const validCategories = ["Hot Drink", "Cold Drink", "Savoury", "Vegetarian"];
      if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
      }

      try {
            const products = await Products.find({ category }).select("name image");

            if (!products || products.length === 0) {
                  return res.status(404).json({ message: `No ${category} products found` });
            }

            res.json(products);
      } catch (err) {
            res.status(500).json({ message: err.message });
      }
});

