const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming User model contains tank data
const auth = require("../middleware/auth");
// const User = require('../models/User'); // Remove this commented-out duplicate require

// Hardcoded petrol price (Update later, e.g., from config or DB)
const PETROL_PRICE = 2.632;

// GET /api/tanks/:userId - Fetch tank data for a specific user
router.get("/:userId", auth, async (req, res) => {
  try {
    // Verify the logged-in user matches the requested userId or is an admin
    if (req.user._id.toString() !== req.params.userId) {
      // Add admin check here if needed
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    const userId = req.params.userId;
    const user = await User.findById(userId).select("tankBalance tankCapacity");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming the User model has 'tankBalance' and 'tankCapacity' fields
    const tankData = {
      balance: user.tankBalance || 0, // Provide default value if field doesn't exist
      capacity: user.tankCapacity || 0, // Provide default value if field doesn't exist
      userId: userId,
    };

    res.json(tankData);
  } catch (error) {
    console.error("Error fetching tank data:", error);
    res
      .status(500)
      .json({ message: "Error fetching tank data", error: error.message });
  }
});

// POST /api/tanks/topup - Top up the user's tank based on dollar amount
router.post("/topup", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid top-up amount provided." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Calculate litres to add based on the amount and price
    const litresToAdd = amount / PETROL_PRICE;
    const currentBalance = user.tankBalance || 0;
    const capacity = user.tankCapacity || 0; // Use default capacity if needed

    if (currentBalance >= capacity) {
      return res.status(400).json({ message: "Tank is already full." });
    }

    // Calculate potential new balance and cap it at capacity
    const potentialNewBalance = currentBalance + litresToAdd;
    let actualLitresToAdd = litresToAdd;
    let finalBalance = potentialNewBalance;

    if (potentialNewBalance > capacity) {
      finalBalance = capacity;
      actualLitresToAdd = capacity - currentBalance; // Calculate only the difference needed to fill
      console.log(
        `Top-up capped. Requested: ${litresToAdd.toFixed(
          2
        )}L, Added: ${actualLitresToAdd.toFixed(2)}L`
      );
    }

    // Ensure we add a positive amount
    if (actualLitresToAdd <= 0) {
      return res.status(400).json({
        message:
          "Calculated top-up amount is zero or negative (likely due to full tank).",
      });
    }

    // Update user's tank balance
    user.tankBalance = finalBalance;

    await user.save();
    console.log(
      `User ${userId} topped up ${actualLitresToAdd.toFixed(
        2
      )}L. New balance: ${user.tankBalance.toFixed(2)}L`
    );

    // Return the new balance and optionally the litres added
    res.json({
      newBalance: user.tankBalance,
      litresAdded: actualLitresToAdd,
    });
  } catch (error) {
    console.error("Error processing top-up:", error);
    res
      .status(500)
      .json({ message: "Error processing top-up", error: error.message });
  }
});

// Add other tank-related routes here (e.g., POST /:userId/share)

module.exports = router;
