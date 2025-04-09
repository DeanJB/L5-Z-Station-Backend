const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const Products = require("./schema");

dotenv.config();
const PORT = process.env.PORT || 3000;

// const dbURI = process.env.MONGODB_URI;

// Connect to MongoDB Compass
mongoose
      .connect("mongodb://127.0.0.1:27017/Products-Z-Station")
      .then(() => {
            console.log("MongoDB Connected Successfully");
      })
      .catch((err) => console.log("MongoDB Connection Error:", err));

app.listen(PORT, () => {
      console.log(`server running on ${PORT} `);
});

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
