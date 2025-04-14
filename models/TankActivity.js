const mongoose = require("mongoose");

// Removed transactionItemSchema as it's not needed for tank activity

const tankTransactionSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    index: true, // Index for faster querying by phone number
  },
  litersFilled: {
    type: Number,
    required: true,
    min: 0,
  },
  pricePerLiter: {
    type: Number,
    required: true,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Optional link to the User model
    required: false,
  },
});

// Pre-save hook to calculate totalCost if not provided
tankTransactionSchema.pre("save", function (next) {
  if (this.isModified("litersFilled") || this.isModified("pricePerLiter")) {
    // Avoid floating point issues by calculating with integers (cents)
    const cost =
      Math.round(this.litersFilled * 100 * (this.pricePerLiter * 100)) / 10000;
    this.totalCost = parseFloat(cost.toFixed(2));
  }
  next();
});

// This model will use the default connection (Products-Z-Station)
// and store data in the 'transactions' collection.
// Renamed schema variable but kept model name 'Transaction' as requested.
module.exports = mongoose.model("Transaction", tankTransactionSchema);
