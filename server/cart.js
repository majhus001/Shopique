const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String },
  quantity: { type: Number },
  description: { type: String },
  image: { type: String },
  category: { type: String },
  deliverytime: { type: String },
  rating: { type: Number },
  addedAt: { type: Date, default: Date.now }, // Timestamp for when the product was added
});

const Cart = mongoose.model("Cart", cartSchema);

// API Endpoint
router.post("/add", async (req, res) => {
  try {
    const {
      userId,
      itemId,
      name,
      price,
      brand,
      quantity,
      description,
      image,
      category,
      deliverytime,
      rating,
    } = req.body;

    // Validate required fields
    if (!userId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, name, or price.",
      });
    }

    // Create a new cart item
    const cartItem = new Cart({
      userId,
      itemId,
      name,
      price,
      brand,
      quantity,
      description,
      image,
      category,
      deliverytime,
      rating,
    });

    // Save the cart item to the database
    await cartItem.save();

    res
      .status(201)
      .json({ success: true, message: "Product added to cart successfully." });
  } catch (error) {
    console.error("Error saving to cart:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

router.get("/fetch", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required to fetch the cart.",
    });
  }

  try {
    // Fetch cart items for the user from the database
    const cartItems = await Cart.find({ userId });

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No items found in the cart for this user.",
      });
    }

    res.status(200).json({
      success: true,
      cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the cart data.",
    });
  }
});

router.get("/check", async (req, res) => {
  const { userId, itemId } = req.query;

  try {
    const cartItem = await Cart.findOne({ userId: userId, itemId: itemId });

    if (cartItem) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking item in cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update-quantity", async (req, res) => {
  const { userId, itemId, quantity } = req.body; // Extract data from request body

  console.log("b b a")
  // Validate request
  if (!userId || !itemId || !quantity || quantity < 1) {
    return res.status(400).json({
      message:
        "Invalid input. Please provide userId, itemId, and quantity >= 1.",
    });
  }
  console.log("b b a 2")

  try {
    // Find the document by userId and itemId, then update the quantity
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, itemId }, // Match userId and itemId
      { $set: { quantity: quantity } }, // Update the quantity field
      { new: true } // Return the updated document
    );

    console.log(updatedCart)

    if (!updatedCart) {
      return res.status(404).json({
        message: "Cart item not found or userId and itemId mismatch.",
      });
    }

    return res.status(200).json({
      message: "Cart item quantity updated successfully.",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return res.status(500).json({
      message: "Failed to update item quantity. Please try again.",
    });
  }
});

router.delete("/delete/:itemId", async (req, res) => {
  const { itemId } = req.params;

  try {
    const item = await Cart.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete the item
    await Cart.findByIdAndDelete(itemId);

    // Send a success response
    res.status(200).json({ message: "Item removed successfully" });
  } catch (error) {
    // Log the error and respond with an error message
    console.error("Error removing item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Cart.deleteMany({ userId });

    res.json({ success: true, message: "Cart cleared successfully!" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
});


module.exports = router;
