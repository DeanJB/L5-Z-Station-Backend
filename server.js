const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

const dbURI = process.env.MONGODB_URI;

// Connect to MongoDB Atlas
mongoose
      .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log("MongoDB Connected"))
      .catch((err) => console.log(err));

// Schema
const productsSchema = new mongoose.Schema({
      name: String,
      image: String,
});

const Products = mongoose.model("products", productsSchema);

// Dean API endpoint
app.get("/api/products", async (req, res) => {
      try {
            const manyProducts = await Products.find();
            res.json(manyProducts);
      } catch (err) {
            res.status(500).json({ message: err.message });
      }
});
// >>>>>>>>>>>>>>>>>>>

// Mac API endpoint

// >>>>>>>>>>>>>>>>>>>

// Hamish API endpoint

// >>>>>>>>>>>>>>>>>>>

app.listen(port, () => console.log(`Server started on port ${port}`));
