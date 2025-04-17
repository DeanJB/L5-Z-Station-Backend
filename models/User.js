const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Import bcrypt

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^(\+64|0)[2-9]\d{7,9}$/, "Please enter a valid NZ phone number"],
    },
    cardNumber: {
      type: String,
      trim: true,
      select: false, // Exclude by default when fetching user data
    },
    expiryDate: {
      type: String,
      trim: true,
      select: false, // Exclude by default
    },
    cvv: {
      type: String,
      trim: true,
      select: false, // Exclude by default
    },
    nameOnCard: {
      type: String,
      trim: true,
      select: false, // Exclude by default
    },
    cardBrand: {
      type: String,
      trim: true,
    },
    cardLast4: {
      type: String,
      trim: true,
    },
    tankBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    tankCapacity: {
      type: Number,
      required: true,
      default: 225,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash card number
userSchema.pre("save", async function (next) {
  // Only hash the card number if it has been modified (or is new)
  if (!this.isModified("cardNumber") || !this.cardNumber) return next();

  try {
    // Generate a salt and hash the card number
    const salt = await bcrypt.genSalt(10); // 10 rounds is generally recommended
    this.cardNumber = await bcrypt.hash(this.cardNumber, salt);
    next();
  } catch (error) {
    console.error("Error hashing card number:", error);
    next(error); // Pass error to Mongoose
  }
});

// Hash password before saving - Removed as password is not used
/*
userSchema.pre("save", async function (next) {
  // Check if password exists on the document and if it has been modified
  if (!this.password || !this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
*/

// Method to compare passwords (Removed as login uses OTP)
/*
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
*/

// Create the model - It will use the default connection (Products-Z-Station)
// and store data in the 'users' collection (Mongoose pluralizes 'User').
const User = mongoose.model("User", userSchema);

// The explicit database definition below is removed to use the default connection.
// const User = mongoose.model("User", userSchema, "Users", {
//   database: "Accounts",
// });

module.exports = User;
