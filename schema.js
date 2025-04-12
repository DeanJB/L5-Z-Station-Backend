const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
      name: String,
      image: [String],
      description: String,
      sizes: [String],
      milkOptions: [String],
      strengthOptions: [String],
      flavourOptions: [String],
      price: {
            medium: Number,
            large: Number,
            default: Number,
      },
      category: String,
      ExtraShotPrice: Number,
      flavourPrice: Number,
      allergens: [String],
      ingredients: [String],
});

module.exports = mongoose.model("Products", productsSchema, "Products-Data");
