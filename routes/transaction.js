const express = require("express");
const router = express.Router();
const TankActivity = require("../models/TankActivity");
const User = require("../models/User"); // Optional: To link userId

// --- Create a new Tank Transaction ---
// POST /api/transactions
router.post("/", async (req, res) => {
  const {
    phoneNumber,
    // Removed 'items'
    litersFilled,
    pricePerLiter,
    // Removed 'totalAmount' (will be calculated or can be passed)
    totalCost, // Optional: Can be passed or calculated by pre-save hook
  } = req.body;

  // Basic validation for required fields
  if (
    !phoneNumber ||
    litersFilled === undefined ||
    pricePerLiter === undefined
  ) {
    return res.status(400).json({
      message:
        "Missing required tank transaction data (phoneNumber, litersFilled, pricePerLiter).",
    });
  }

  if (
    typeof litersFilled !== "number" ||
    typeof pricePerLiter !== "number" ||
    litersFilled < 0 ||
    pricePerLiter < 0
  ) {
    return res.status(400).json({
      message: "litersFilled and pricePerLiter must be non-negative numbers.",
    });
  }

  try {
    // Optional: Find user by phone number to link userId
    const user = await User.findOne({ phoneNumber: phoneNumber });

    const newActivityData = {
      phoneNumber,
      litersFilled,
      pricePerLiter,
      userId: user ? user._id : null, // Link user ID if found
    };

    // Include totalCost only if it was explicitly provided in the request
    // Otherwise, let the pre-save hook calculate it.
    if (totalCost !== undefined) {
      if (typeof totalCost !== "number" || totalCost < 0) {
        return res.status(400).json({
          message: "If provided, totalCost must be a non-negative number.",
        });
      }
      newActivityData.totalCost = totalCost;
    }

    const newTankActivity = new TankActivity(newActivityData);

    const savedActivity = await newTankActivity.save();
    res.status(201).json(savedActivity);
  } catch (error) {
    console.error("Error creating tank transaction:", error);
    // Handle potential validation errors from the schema
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({
      message: "Failed to create tank transaction",
      error: error.message,
    });
  }
});

// --- Get Tank Activities by Phone Number ---
// GET /api/transactions/:phoneNumber
router.get("/:phoneNumber", async (req, res) => {
  const phoneNumber = req.params.phoneNumber;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  try {
    // Find activities matching the phone number using the renamed model
    // Sort by timestamp descending (newest first)
    const activities = await TankActivity.find({
      phoneNumber: phoneNumber,
    }).sort({ timestamp: -1 });

    if (!activities || activities.length === 0) {
      return res
        .status(404)
        .json({ message: "No tank activities found for this phone number." });
    }

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching tank activities:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch tank activities",
        error: error.message,
      });
  }
});

module.exports = router;
