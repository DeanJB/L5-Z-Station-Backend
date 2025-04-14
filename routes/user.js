const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User"); // Import User model

// Helper function to detect card brand (simplified)
const getCardBrand = (cardNumber) => {
  const num = cardNumber.replace(/\s/g, "");
  if (/^4/.test(num)) return "visa";
  if (/^5[1-5]/.test(num)) return "mastercard";
  // Add more checks if needed
  return "unknown";
};

// Get user details
router.get("/me", auth, async (req, res) => {
  try {
    // Fetch user without sensitive info if possible
    // const user = await User.findById(req.user._id).select('-password -cardNumber -cvv'); // Example if sensitive fields exist
    const user = await User.findById(req.user._id).select("-password"); // Select requires Mongoose model

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      // Include other non-sensitive fields as needed
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user details", error: error.message });
  }
});

// Update user payment details
router.put("/me/payment", auth, async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, nameOnCard } = req.body;
    const userId = req.user._id;

    if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
      return res
        .status(400)
        .json({ message: "Missing required payment fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const rawCardNumber = cardNumber.replace(/\s/g, "");
    const brand = getCardBrand(rawCardNumber);
    const last4 = rawCardNumber.slice(-4);

    // Update payment details
    // WARNING: Storing raw card details is insecure. Use tokenization in production.
    user.cardNumber = rawCardNumber; // Store raw number (INSECURE - for demo only)
    user.expiryDate = expiryDate;
    user.cvv = cvv; // Store CVV (VERY INSECURE - for demo only)
    user.nameOnCard = nameOnCard;
    user.cardBrand = brand; // Store derived brand
    user.cardLast4 = last4; // Store derived last 4 digits

    await user.save();

    res.json({ message: "Payment details updated successfully" });
  } catch (error) {
    console.error("Error updating payment details:", error);
    res.status(500).json({
      message: "Error updating payment details",
      error: error.message,
    });
  }
});

// NEW: Get user payment summary (last 4 and brand)
router.get("/me/payment-summary", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch only the required fields from the user
    const user = await User.findById(userId).select("cardLast4 cardBrand");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the specific fields exist (were saved previously)
    if (!user.cardLast4 || !user.cardBrand) {
      return res
        .status(404)
        .json({ message: "Payment details not found for this user" });
      // OR: return res.json({}); // Return empty object if preferred
    }

    res.json({
      last4: user.cardLast4,
      brand: user.cardBrand,
    });
  } catch (error) {
    console.error("Error fetching payment summary:", error);
    res.status(500).json({
      message: "Error fetching payment summary",
      error: error.message,
    });
  }
});

module.exports = router;
